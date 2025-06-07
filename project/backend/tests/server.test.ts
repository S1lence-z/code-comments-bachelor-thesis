import { assertEquals } from "jsr:@std/assert";

Deno.test(function testAdd() {
  assertEquals(1 + 1, 2);
  console.log("Test passed: 1 + 1 equals 2");
});
