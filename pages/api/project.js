import connectDB from '../../utils/dbConnect';
import Project from '../../models/Project';

export default async function handler(req, res) {
  const { method } = req;

  await connectDB();

  switch (method) {
    case 'GET':
      try {
        const projects = await Project.find({});
        res.status(200).json({ success: true, data: projects });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      }
      break;
    
    case 'POST':
      try {
        const project = await Project.create(req.body);
        res.status(201).json({ 
          success: true, 
          data: project 
        });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      }
      break;
    
    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        const project = await Project.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true
        });
        
        if (!project) {
          return res.status(404).json({ 
            success: false, 
            message: 'Project not found' 
          });
        }
        
        res.status(200).json({ 
          success: true, 
          data: project 
        });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      }
      break;
    
    case 'DELETE':
      try {
        const { id } = req.query;
        const deletedProject = await Project.deleteOne({ _id: id });
        
        if (deletedProject.deletedCount === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Project not found' 
          });
        }
        
        res.status(200).json({ 
          success: true, 
          message: 'Project deleted successfully' 
        });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      }
      break;
    
    default:
      res.status(400).json({ 
        success: false, 
        message: 'Invalid request method' 
      });
      break;
  }
}
