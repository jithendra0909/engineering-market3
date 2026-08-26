import Department from '../models/Department.js';
import User from '../models/User.js';

// @desc    Get all departments (public: active only, admin ?showAll=true: all)
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res) => {
  try {
    let query = {};
    if (!(req.query.showAll === 'true' && req.user && req.user.role === 'admin')) {
      query.isActive = true;
    }
    const departments = await Department.find(query).sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving departments', error: error.message });
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Admin
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A department with this name already exists' });
    }
    const department = await Department.create({ name: name.trim() });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating department', error: error.message });
  }
};

// @desc    Update department (rename or toggle isActive)
// @route   PUT /api/departments/:id
// @access  Admin
const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    const { name, isActive } = req.body;
    if (name !== undefined) {
      const existing = await Department.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'A department with this name already exists' });
      }
      department.name = name.trim();
    }
    if (isActive !== undefined) {
      department.isActive = isActive;
    }
    const updated = await department.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating department', error: error.message });
  }
};

// @desc    Delete department (block if students reference it)
// @route   DELETE /api/departments/:id
// @access  Admin
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    const studentCount = await User.countDocuments({ department: department.name });
    if (studentCount > 0) {
      return res.status(400).json({
        message: `Cannot delete "${department.name}" because ${studentCount} student(s) are registered under it. Deactivate it instead so it stops appearing for new signups.`
      });
    }
    await department.deleteOne();
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting department', error: error.message });
  }
};

export { getDepartments, createDepartment, updateDepartment, deleteDepartment };
