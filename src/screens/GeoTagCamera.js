import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Geolocation from 'react-native-geolocation-service';
import RNFS from 'react-native-fs';

const { width, height } = Dimensions.get('window');

const GeoTagCamera = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  const cameraRef = useRef(null);
  const device = useCameraDevice('back');

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    setLoading(true);
    
    // Request Camera Permission
    const cameraStatus = await Camera.requestCameraPermission();
    setHasCameraPermission(cameraStatus === 'authorized');
    
    // Request Location Permission (Platform specific)
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to stamp coordinates on photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
        setHasLocationPermission(false);
      }
    } else {
      // iOS
      Geolocation.requestAuthorization('whenInUse');
      const locationStatus = await checkLocationPermission();
      setHasLocationPermission(locationStatus);
      if (locationStatus) {
        getCurrentLocation();
      }
    }
    
    setLoading(false);
  };

  const checkLocationPermission = async () => {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        (error) => {
          console.log('Location permission error:', error);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  };

  const getCurrentLocation = () => {
    setLocationError(null);
    
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude: latitude,
          longitude: longitude,
          timestamp: position.timestamp,
        });
        console.log('Location captured:', latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to get current location';
        
        switch (error.code) {
          case 1:
            errorMessage = 'Location permission denied';
            break;
          case 2:
            errorMessage = 'Location unavailable. Please check GPS';
            break;
          case 3:
            errorMessage = 'Location request timeout';
            break;
        }
        
        setLocationError(errorMessage);
        Alert.alert('Location Error', errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || !hasCameraPermission) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    setLoading(true);
    
    try {
      // Get fresh location right before capture
      if (hasLocationPermission) {
        await getCurrentLocation();
        // Wait a moment for location to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Capture the photo
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'auto',
      });
      
      // Store the photo path and location
      setCapturedPhoto(photo.path);
      setPhotoSaved(false);
      
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Capture Failed', 'Failed to capture photo');
    } finally {
      setLoading(false);
    }
  };

  const savePhotoWithLocation = async () => {
    if (!capturedPhoto || !location) {
      Alert.alert('Error', 'Missing photo or location data');
      return;
    }

    setLoading(true);
    
    try {
      // Create a location data file with the same name as the image
      const imageFileName = capturedPhoto.split('/').pop();
      const locationFileName = imageFileName.replace('.jpg', '_location.json');
      const locationFilePath = `${RNFS.DocumentDirectoryPath}/${locationFileName}`;
      
      const locationData = {
        imagePath: capturedPhoto,
        imageName: imageFileName,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
        deviceTimestamp: location.timestamp,
      };
      
      // Save location data as JSON file
      await RNFS.writeFile(locationFilePath, JSON.stringify(locationData, null, 2), 'utf8');
      
      // Also save a text file with just coordinates for easy reading
      const textFileName = imageFileName.replace('.jpg', '_coordinates.txt');
      const textFilePath = `${RNFS.DocumentDirectoryPath}/${textFileName}`;
      const coordinateText = `Latitude: ${location.latitude}\nLongitude: ${location.longitude}\nDate: ${new Date().toLocaleString()}`;
      await RNFS.writeFile(textFilePath, coordinateText, 'utf8');
      
      setPhotoSaved(true);
      
      Alert.alert(
        'Success', 
        `Photo saved with location!\n\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}\n\nLocation data saved as separate files.`,
        [
          { text: 'OK', onPress: () => console.log('Saved successfully') }
        ]
      );
      
    } catch (error) {
      console.error('Error saving location data:', error);
      Alert.alert('Error', 'Failed to save location data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoSaved(false);
    setCameraActive(true);
    setLocationError(null);
    // Refresh location when retaking
    if (hasLocationPermission) {
      getCurrentLocation();
    }
  };

  // Generate Google Maps link from coordinates
  const getGoogleMapsLink = () => {
    if (location) {
      return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    }
    return '#';
  };

  // Render camera screen
  const renderCameraScreen = () => {
    if (loading && !device) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      );
    }

    if (!hasCameraPermission) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Camera permission required</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermissions}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No camera device found</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={cameraActive}
          photo={true}
        />
        
        {/* Location Status Overlay */}
        <View style={styles.locationOverlay}>
          {locationError ? (
            <Text style={styles.locationErrorText}>⚠️ {locationError}</Text>
          ) : location ? (
            <Text style={styles.locationText}>
              📍 {location.latitude.toFixed(6)}°, {location.longitude.toFixed(6)}°
            </Text>
          ) : (
            <Text style={styles.locationText}>📍 Waiting for location...</Text>
          )}
        </View>
        
        {/* Instruction Text */}
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>Tap button to capture photo</Text>
        </View>
        
        {/* Capture Button */}
        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={capturePhoto} 
          disabled={loading}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Capturing...</Text>
          </View>
        )}
      </View>
    );
  };

  // Render preview screen
  const renderPreviewScreen = () => {
    if (!capturedPhoto) return null;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.previewScrollView}>
          <Image source={{ uri: `file://${capturedPhoto}` }} style={styles.previewImage} />
          
          {/* Location Stamp Overlay on Image */}
          {location && !photoSaved && (
            <View style={styles.stampOverlay}>
              <Text style={styles.stampTitle}>📍 LOCATION STAMPED</Text>
              <Text style={styles.stampText}>
                Latitude: {location.latitude.toFixed(6)}°
              </Text>
              <Text style={styles.stampText}>
                Longitude: {location.longitude.toFixed(6)}°
              </Text>
              <Text style={styles.stampSubtext}>
                {new Date().toLocaleString()}
              </Text>
            </View>
          )}
          
          {/* Photo Information Panel */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>📷 Photo Information</Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, photoSaved && styles.savedStatus]}>
                {photoSaved ? '✓ Saved with location' : 'Ready to save'}
              </Text>
            </View>
            
            {location ? (
              <>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Latitude:</Text>
                  <Text style={styles.infoValue}>{location.latitude.toFixed(6)}°</Text>
                </View>
                
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Longitude:</Text>
                  <Text style={styles.infoValue}>{location.longitude.toFixed(6)}°</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.mapLinkButton}
                  onPress={() => {
                    const url = getGoogleMapsLink();
                    Alert.alert('Open in Maps', `Open coordinates in Google Maps?\n\n${url}`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Open', onPress: () => Linking.openURL(url) }
                    ]);
                  }}>
                  <Text style={styles.mapLinkText}>🗺️ Open in Google Maps</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.errorText}>Not available</Text>
              </View>
            )}
            
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Date/Time:</Text>
              <Text style={styles.infoValue}>{new Date().toLocaleString()}</Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={retakePhoto}>
            <Text style={styles.buttonText}>📸 Retake</Text>
          </TouchableOpacity>
          
          {!photoSaved ? (
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={savePhotoWithLocation}
              disabled={!location || loading}>
              <Text style={styles.buttonText}>
                {!location ? '⏳ Getting Location...' : '💾 Save with Location'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.doneButton]} onPress={retakePhoto}>
              <Text style={styles.buttonText}>✨ Take Another Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Saving...</Text>
          </View>
        )}
      </View>
    );
  };

  return capturedPhoto ? renderPreviewScreen() : renderCameraScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  locationOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 12,
    borderRadius: 10,
    zIndex: 10,
  },
  locationText: {
    color: '#4CD964',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  locationErrorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  instructionOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  previewScrollView: {
    flex: 1,
  },
  previewImage: {
    width: width,
    height: height * 0.45,
    resizeMode: 'cover',
  },
  stampOverlay: {
    position: 'absolute',
    top: height * 0.45 - 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  stampTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stampText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 2,
  },
  stampSubtext: {
    color: '#ccc',
    fontSize: 11,
    marginTop: 8,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  savedStatus: {
    color: '#34C759',
  },
  mapLinkButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    alignItems: 'center',
  },
  mapLinkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  doneButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default GeoTagCamera;