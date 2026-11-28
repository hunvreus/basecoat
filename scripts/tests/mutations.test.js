import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

const runtime = fs.readFileSync(new URL('../../src/js/basecoat.js', import.meta.url), 'utf8');

function setup(onInit) {
  const { window, document } = parseHTML('<html><body></body></html>');
  vm.runInNewContext(runtime, {
    window, document, Node: window.Node, MutationObserver: window.MutationObserver, console,
  });
  const api = window.basecoat;
  const events = [];
  api.register('probe', '.probe', element => {
    events.push('init ' + element.id);
    element.dataset.probeInitialized = 'true';
    element._destroy = () => events.push('destroy ' + element.id);
    onInit?.(element, api);
  });
  api.start();
  return { document, api, events };
}

test('a lease acquired within one added subtree pauses its remaining children', () => {
  let resume;
  const { api, document, events } = setup((element, runtime) => {
    if (element.id === 'a') resume = runtime.deferMutations();
  });
  const release = api.deferMutations();
  const group = document.createElement('section');
  group.innerHTML = '<i id="a" class="probe"></i><i id="b" class="probe"></i>';
  document.body.append(group);
  release();
  assert.deepEqual(events, ['init a']);
  group.lastElementChild.remove();
  group.insertAdjacentHTML('beforeend', '<i id="c" class="probe"></i>');
  resume();
  assert.deepEqual(events, ['init a', 'init c']);
  api.stop();
});

test('overlapping leases reconcile a settled replacement and skip transient nodes', () => {
  const { api, document, events } = setup();
  document.body.innerHTML = '<i id="old" class="probe"></i>';
  api.deferMutations()();
  const first = api.deferMutations();
  const second = api.deferMutations();
  document.body.innerHTML = '<i id="temp" class="probe"></i>';
  document.body.innerHTML = '<i id="new" class="probe"></i>';
  second();
  second();
  assert.deepEqual(events, ['init old']);
  first();
  assert.deepEqual(events, ['init old', 'destroy old', 'init new']);
  api.stop();
});

test('stopping during deferral cleans up removals and leaves additions for explicit init', () => {
  const { api, document, events } = setup();
  document.body.innerHTML = '<i id="before" class="probe"></i>';
  api.deferMutations()();
  const release = api.deferMutations();
  document.body.innerHTML = '<i id="after" class="probe"></i>';
  api.stop();
  release();
  assert.deepEqual(events, ['init before', 'destroy before']);
  api.start();
  api.initAll();
  assert.deepEqual(events, ['init before', 'destroy before', 'init after']);
  api.stop();
});
