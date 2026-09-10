/**
 * {% or content1 content2 content3 %}
 */
'use strict'

module.exports = ctx => function(args) {
  let items = args.map(function(arg) {
    return String(arg).trim()
  }).filter(function(arg) {
    return arg
  })
  if (!items.length) {
    return '';
  }
  let el = items.map(function(item, i) {
    return `<span class="or-item">${item}</span>${i < items.length - 1 ? '<span class="or-sep">/</span>' : ''}`
  }).join('')

  return el;

}
