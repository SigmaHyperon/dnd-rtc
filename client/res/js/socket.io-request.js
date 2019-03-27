class SocketIORequest {
    constructor (io, options = {}) {
      this.io = io
      this.options = Object.assign({
        event: 'socket.io-request',
        timeout: 90000
      }, options)
    }
  
    request (method, data) {
      if (typeof method !== 'string') throw new Error('argument "method" is missing')
  
      return new Promise((resolve, reject) => {
        this.io.emit(this.options.event, {method, data}, (res) => {
          clearTimeout(timeout)
          this.io.removeListener('disconnect', onDisconnect)
          if (res.error) return reject(res.error);
          resolve(res.data)
        })
  
        const onDisconnect = () => {
          clearTimeout(timeout)
          reject(new Error('disconnect'))
        }
  
        const timeout = setTimeout(() => {
          this.io.removeListener('disconnect', onDisconnect)
          reject(new Error(`exceeded ${this.options.timeout} (msec)`))
        }, this.options.timeout)
  
        this.io.once('disconnect', onDisconnect)
      })
    }
  
    response (method, callback) {
      if (typeof method !== 'string') throw new Error('argument "method" is missing')
      if (typeof callback !== 'function') {
        throw new Error('"middlewares" must be a function')
      }
      this.io.on(this.options.event, (req, ack) => {
        if (req.method !== method) return
        const res = data => ack({data})
        res.error = err => ack({error: err})
        callback(req.data, res)
      })
    }
  }