module.exports = {
  logs() {
    this.pm2.Client.launchBus((error, bus) => {
      if (error) {
        return this.sendError(error)
      }

      bus.on('process:event', (packet) => {
        this.sendMessage({
          timestamp: packet.at,
          type: 'process_event',
          status: packet.event,
          appName: packet.process.name,
        })
      })

      bus.on('log:*', (type, packet) => {
        if (type === 'PM2') {
          return
        }

        if (typeof packet.data == 'string') {
          packet.data = packet.data.replace(/(\r\n|\n|\r)/gm, '')
        }

        this.sendMessage({
          message: packet.data,
          timestamp: packet.at,
          type: type,
          processId: packet.process.pm_id,
          appName: packet.process.name,
        })
      })
    })
  },
  status() {
    this.pm2.Client.executeRemote('getMonitorData', {}, (error, list) => {
      if (error) {
        return this.sendError(error)
      }

      this.sendMessage(list)
    })
  },
}
