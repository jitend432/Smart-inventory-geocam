import React, { useRef, useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client/dist/sockjs'; // ✅ Fixed import

const ChatPage = () => {
  const client = useRef(null);
  const [receiverId, setReceiverId] = useState("1");
  const [message, setMessage] = useState("chat testing");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Disconnected");

  const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqaXRlbmRyYS5oZXhhd2FycmVAZ21haWwuY29tIiwicm9sZXMiOiJST0xFX1VTRVIiLCJpYXQiOjE3ODQyODM2OTUsImV4cCI6MTc4NDg4ODQ5NSwicmVnaXN0cmF0aW9uSWQiOjEwLCJwcm9maWxlSWQiOjZ9.C4I8pctMzDSItB0VhUAtrYHSG_7RW0a2guLPsPoCl9eNMoDmfVtsFH5U-lU36HjKr7pyWLF-ZGzqdjV-_4FIug";

  const print = (msg) => {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  };

  useEffect(() => {
    return () => {
      if (client.current) {
        print("🔌 Auto-disconnecting on page leave...");
        client.current.deactivate();
      }
    };
  }, []);

  const connect = () => {
    if (client.current && status === "Connected") {
      print("⚠️ Already Connected!");
      return;
    }

    if (client.current) {
      print("Cleaning old instance...");
      client.current.deactivate();
    }

    // ✅ Use SockJS for better compatibility
    //const serverUrl = "http://192.168.29.108:8080/ws";
    const serverUrl = "https://vynkdating.com/ws";
    
    print(`🔄 Connecting to ${serverUrl} ...`);
    setStatus("Connecting...");

    const stompClient = new Client({
      // ✅ Use SockJS for WebSocket fallback
      webSocketFactory: () => {
        // SockJS handles the protocol negotiation automatically
        const sock = new SockJS(serverUrl);
        return sock;
      },
      
      // ✅ Correct way to send authentication
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      
      // ✅ Proper heartbeat for mobile networks
      heartbeatIncoming: 10000, // 10 seconds
      heartbeatOutgoing: 10000,
      
      // ✅ Reconnect with exponential backoff
      reconnectDelay: 5000,
      maxRetryDelay: 60000,
      
      debug: (str) => {
        print(`🛠️ ${str}`);
      },

      onConnect: (frame) => {
        setStatus("Connected");
        print("✅ CONNECTED SUCCESSFULLY");
        print(`📋 Connected with session: ${frame.headers['session'] || 'N/A'}`);

        // ✅ Subscribe to user-specific messages
        stompClient.subscribe("/user/queue/messages", (msg) => {
          print("📩 MESSAGE RECEIVED");
          try {
            const parsed = JSON.parse(msg.body);
            print(`📨 ${JSON.stringify(parsed, null, 2)}`);
          } catch (e) {
            print(`📨 ${msg.body}`);
          }
        });

        print("👍 SUBSCRIBED to /user/queue/messages");
        
        // ✅ Optional: Also subscribe to public topic if needed
        // stompClient.subscribe("/topic/public", (msg) => {
        //   print(`📢 Public message: ${msg.body}`);
        // });
      },

      onStompError: (frame) => {
        setStatus("Error");
        print("❌ STOMP ERROR");
        print(`📋 Headers: ${JSON.stringify(frame.headers)}`);
        if (frame.headers && frame.headers["message"]) {
          print(`💬 Message: ${frame.headers["message"]}`);
        }
        if (frame.body) {
          print(`📄 Body: ${frame.body}`);
        }
      },

      onWebSocketError: (error) => {
        setStatus("Disconnected");
        print("⚠️ WEBSOCKET ERROR");
        print(error.toString());
        // ✅ Better error logging
        if (error.message) {
          print(`📝 ${error.message}`);
        }
      },

      onWebSocketClose: (event) => {
        setStatus("Disconnected");
        print(`🔌 WebSocket Closed. Code: ${event.code}, Reason: ${event.reason || 'N/A'}`);
      },

      onDisconnect: () => {
        setStatus("Disconnected");
        print("🛑 Disconnected explicitly.");
      },
    });

    client.current = stompClient;
    stompClient.activate();
  };

  const send = () => {
    if (!client.current || status !== "Connected") {
      print("❌ Cannot Send: Not Connected!");
      return;
    }

    const payload = {
      receiverId: Number(receiverId),
      message: message,
      // ✅ Optional: Add timestamp or sender info
      timestamp: new Date().toISOString(),
    };

    try {
      client.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
        // ✅ Optional: Add headers if needed
        // headers: { 'content-type': 'application/json' }
      });
      print(`🚀 MESSAGE SENT to ${receiverId}: ${message}`);
    } catch (error) {
      print(`❌ Send error: ${error.message}`);
    }
  };

  const disconnect = () => {
    if (client.current) {
      client.current.deactivate();
      setStatus("Disconnected");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Spring Boot WebSocket Chat</Text>
      
      <Text style={[styles.statusText, status === "Connected" ? styles.green : styles.red]}>
        Status: {status}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Receiver Id</Text>
        <TextInput
          style={styles.input}
          value={receiverId}
          onChangeText={setReceiverId}
          keyboardType="numeric"
          placeholder="Enter receiver ID"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.btn, styles.connectBtn]} onPress={connect}>
          <Text style={styles.btnText}>CONNECT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.sendBtn]} onPress={send}>
          <Text style={styles.btnText}>SEND</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.disconnectBtn]} onPress={disconnect}>
          <Text style={styles.btnText}>DISCONNECT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        <Text style={styles.logText}>
          {logs.length > 0 ? logs.join("\n") : "No logs yet..."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  green: { color: "#28a745" },
  red: { color: "#dc3545" },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 4,
  },
  connectBtn: { backgroundColor: "#28a745" },
  sendBtn: { backgroundColor: "#007bff" },
  disconnectBtn: { backgroundColor: "#dc3545" },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  logContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  logText: {
    fontSize: 12,
    color: "#333",
  },
});

export default ChatPage;