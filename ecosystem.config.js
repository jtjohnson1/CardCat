module.exports = {
  apps: [{
    name: 'cardcataloger-backend',
    cwd: '/opt/cardcataloger/server',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/cardcataloger/backend-error.log',
    out_file: '/var/log/cardcataloger/backend-out.log',
    log_file: '/var/log/cardcataloger/backend-combined.log',
    time: true
  }]
};