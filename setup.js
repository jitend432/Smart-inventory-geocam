// setup.js
const fs = require('fs');
const path = require('path');

// Saari files aur unke folders ki list
const filesToCreate = [
  'src/components/common/Button.js',
  'src/components/common/Input.js',
  'src/components/common/Header.js',
  'src/components/common/ConfirmationModal.js',
  'src/components/ItemCard.js',
  'src/screens/AddItemScreen.js',
  'src/screens/UpdateItemScreen.js',
  'src/screens/DeleteItemScreen.js',
  'src/redux/store.js',
  'src/redux/slices/itemSlice.js',
  'src/redux/hooks.js',
  'src/navigation/AppNavigator.js',
  'src/utils/validation.js',
  'src/constants/theme.js',
  'src/services/storageService.js',
  
];

console.log('🏗️ Creating your structure...');

filesToCreate.forEach(filePath => {
  const absolutePath = path.join(process.cwd(), filePath);
  const dirPath = path.dirname(absolutePath);

  // Agar folder nahi bana hai, toh pehle folder create karo
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Agar file pehle se nahi bani hai, toh empty file banao
  if (!fs.existsSync(absolutePath)) {
    fs.writeFileSync(absolutePath, '', 'utf8');
    console.log(`✅ Created: ${filePath}`);
  } else {
    console.log(`⚠️ Already exists: ${filePath}`);
  }
});

console.log('🚀 Poora folder structure ready hai!');