module.exports.logStream = (pm2, callback) => {
  pm2.Client.launchBus((error, bus) => {
    if (error) {
      throw new Error(error)
    }

    bus.on('process:event', (packet) => {
      callback({
        timestamp: packet.at,
        type: 'process_event',
        status: packet.event,
        appName: packet.process.name,
      })
    })

    bus.on('log:*', function (type, packet) {
      if (type === 'PM2') {
        return
      }

      if (typeof packet.data == 'string') {
        packet.data = packet.data.replace(/(\r\n|\n|\r)/gm, '')
      }

      callback({
        message: packet.data,
        timestamp: packet.at,
        type: type,
        processId: packet.process.pm_id,
        appName: packet.process.name,
      })
    })
  })
}
