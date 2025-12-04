let ioRef = null

export const registerSocketHandlers = (io) => {
  ioRef = io
  io.on('connection', (socket) => {
    socket.on('joinProject', (projectId) => {
      socket.join(`project:${projectId}`)
    })

    socket.on('leaveProject', (projectId) => {
      socket.leave(`project:${projectId}`)
    })

    socket.on('disconnect', () => {})
  })
}

export const broadcastProjectEvent = (projectId, event, payload) => {
  if (!ioRef) return
  ioRef.to(`project:${projectId}`).emit(event, payload)
}
