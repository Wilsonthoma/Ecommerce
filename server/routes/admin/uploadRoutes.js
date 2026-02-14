// server/routes/admin/uploadRoutes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
// ✅ IMPORT CORRECTLY - import the named export, not the default object
import { upload } from '../../utils/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..', '..');

// ✅ This will now work because upload is a function, not an object
router.post('/', protect, upload.single('file'), (req, res) => {
  // ... your code
});

router.post('/multiple', protect, upload.array('files', 10), (req, res) => {
  // ... your code
});

router.delete('/:filename', protect, async (req, res) => {
  // ... your code
});

export default router;