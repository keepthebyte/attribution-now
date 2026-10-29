import { test } from 'node:test';
import assert from 'node:assert/strict';
import { label } from '../scripts/agent-hint.js';

const LINUX = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const SWIFTSHADER = 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver)';

test('ARM host with a software GPU is a cloud browser', () => {
  assert.equal(label({ userAgent: LINUX, architecture: 'arm', renderer: SWIFTSHADER }), 'arm-software-gpu');
  assert.equal(label({ userAgent: LINUX, architecture: 'arm', renderer: 'llvmpipe (LLVM 15.0.7, 128 bits)' }), 'arm-software-gpu');
  assert.equal(label({ userAgent: LINUX, architecture: 'arm', renderer: null }), 'arm-nogpu');
});

test('real hardware is not flagged', () => {
  // Raspberry Pi and Asahi Linux: ARM, but a hardware GPU
  assert.equal(label({ userAgent: LINUX, architecture: 'arm', renderer: 'V3D 4.2' }), null);
  assert.equal(label({ userAgent: LINUX, architecture: 'arm', renderer: 'Apple M1 (G13G B1)' }), null);
  // x86 cloud browsers are out of scope for this label
  assert.equal(label({ userAgent: LINUX, architecture: 'x86', renderer: SWIFTSHADER }), null);
  assert.equal(label({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', architecture: 'arm', renderer: SWIFTSHADER }), null);
  assert.equal(label({ userAgent: LINUX, renderer: SWIFTSHADER }), null);
});
