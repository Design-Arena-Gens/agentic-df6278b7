import Project from '../models/Project.js'

export const assertProjectAccess = async (userId, projectId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { members: userId }]
  })
  if (!project) {
    const error = new Error('Project not found or access denied')
    error.statusCode = 404
    throw error
  }
  return project
}
