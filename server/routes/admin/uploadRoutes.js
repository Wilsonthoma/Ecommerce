import express from 'express';
import { protect } from '../../middleware/authMiddleware.js'; 
import { upload } from '../../utils/upload.js'; 
import fs from 'fs'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 

const router = express.Router();

// Create __dirname equivalent for use in directory pathing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to determine the path to the server root (two levels up from routes/admin)
const serverRoot = path.join(__dirname, '..', '..');

// --- POST /api/admin/upload (single file) ---
router.post('/', protect, upload.single('file'), (req, res) => {
// ... (implementation is correct)
});

// --- POST /api/admin/upload/multiple (multiple files) ---
router.post('/multiple', protect, upload.array('files', 10), (req, res) => {
// ... (implementation is correct)
});

// --- DELETE /api/admin/upload/:filename ---
router.delete('/:filename', protect, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Directories must be resolved from the server root.
    // path.join(serverRoot, 'uploads', '...')
    const directories = [
      path.join(serverRoot, 'uploads', 'products'),
      path.join(serverRoot, 'uploads', 'avatars'),
      path.join(serverRoot, 'uploads', 'images'),
      path.join(serverRoot, 'uploads', 'documents')
    ];

    let fileDeleted = false;
    let errorMessage = '';

    for (const directory of directories) {
      const filePath = path.join(directory, filename);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          fileDeleted = true;
          break;
        } catch (error) {
          // Log unlink error but continue searching in case of a permission issue
          errorMessage = error.message; 
        }
      }
    }

    if (fileDeleted) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'File not found',
        message: errorMessage || 'The requested file does not exist'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'File deletion failed',
      message: error.message
    });
  }
});

export default router;