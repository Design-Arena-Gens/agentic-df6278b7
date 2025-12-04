import Project from '../models/Project.js'

export const listProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')

    return res.json({ projects })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load projects' })
  }
}

export const createProject = async (req, res) => {
  try {
    const { name, description, members = [] } = req.body
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [...new Set([...members, req.user._id])]
    })
    const populated = await project.populate('members', 'name email')
    return res.status(201).json({ project: populated })
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create project' })
  }
}

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const project = await Project.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updates,
      { new: true }
    )
      .populate('owner', 'name email')
      .populate('members', 'name email')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    return res.json({ project })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update project' })
  }
}

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    const result = await Project.findOneAndDelete({ _id: id, owner: req.user._id })
    if (!result) {
      return res.status(404).json({ message: 'Project not found or unauthorized' })
    }
    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete project' })
  }
}
