#!/bin/env node
const path = require('path')
const execSync = require('child_process').execSync

const root = path.resolve(__dirname)
// 如果src不在git根目录上，修改成项目需要 lint 的目录
const src = 'src'
const fix = process.env.npm_config_fix ? '--fix' : ''

let error
const exec = function (cmd) {
  try {
    return execSync(cmd, { stdio: [process.stdin, process.stdout, process.stderr] })
  } catch (e) {
    error = true
  }
}

exec(`stylelint "${root}/${src}/**/*.css" ${fix}`)
exec(`stylelint "${root}/${src}/**/*.scss" ${fix}`)
exec(`stylelint "${root}/${src}/**/*.less" ${fix}`)
exec(`eslint ${fix} --ext .js,.jsx ${root}/${src} `)

if (error) {
  if (fix) {
    throw new Error('部分错误已经自动修正，剩余的请手动进行处理。可以再次运行 npm run lint 进行检查')
  } else {
    throw new Error('可以尝试运行 npm run lint --fix 进行错误自动修复')
  }
} else {
  console.log('完美！代码规范检查没有发现任何错误信息!')
}
