const dgram = require('dgram')

class UDPTransport {
  protocol = 'UDP'
  onMessage = null
  onConnect = null
  onDisconnect = null

  constructor(logger, options) {
    this.logger = logger
    this.port = options.port ?? 5060
    this.server = options.server ?? '0.0.0.0'
    this.asteriskPort = options.asteriskPort
    this.asteriskDomain = options.asteriskDomain
  }

  connect() {
    this.client = dgram.createSocket('udp4')

    this.client.on('error', (err) => {
      this.logger.warn('UDP socket closed unexpectedly')
      this.logger.log(err)
      this.client.close()
    })

    this.client.on('message', (msg, rinfo) => {
      this.logMessage('received', msg)

      if (this.onMessage) {
        try {
          this.onMessage(msg.toString('utf8'))
        } catch (e) {
          this.logger.error(e)
          this.logger.error('Exception thrown by onMessage callback')
          throw e
        }
      }
    })

    this.client.on('listening', () => {
      const address = this.client.address()
      this.logger.log(`server listening ${address.address}:${address.port}`)
    })

    return new Promise((resolve, reject) => {
      this.client.bind(this.port, this.server, (err) => {
        if (err) reject(err)
        this._isConnected = true
        resolve()
      })
    })
  }

  logMessage(action, msg) {
    const lines = msg.toString('utf8').split('\r\n')
    this.logger.debug(`${action} ${lines[0]}${lines.length > 1 ? ' [...]' : ''}`)
  }

  isConnected() {
    return this._isConnected
  }

  dispose() {
    return new Promise((resolve, reject) => {
      this.client.close(()=> {
        resolve()
      });
    });
  }

  send(data) {
    this.logMessage('sending', data)
    return new Promise((resolve, reject) => {
      this.client.send(data, 0, data.length, this.asteriskPort, this.asteriskDomain, (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  disconnect() {
    this.client.disconnect()
  }
}

module.exports = UDPTransport
