import assert from "node:assert/strict";
import { test } from "node:test";

import { suggestEmailFix } from "../src/lib/email-typo.ts";

test("common provider slips get the right domain, the part before @ untouched", () => {
  assert.equal(suggestEmailFix("Ayse.Yilmaz@gmial.com"), "Ayse.Yilmaz@gmail.com");
  assert.equal(suggestEmailFix("ali@gmail.con"), "ali@gmail.com");
  assert.equal(suggestEmailFix("ali@gmail.co"), "ali@gmail.com");
  assert.equal(suggestEmailFix("ali@gmail.com.tr"), "ali@gmail.com");
  assert.equal(suggestEmailFix("ali@GMIAL.COM"), "ali@gmail.com");
  assert.equal(suggestEmailFix("ali@hotmial.com"), "ali@hotmail.com");
  assert.equal(suggestEmailFix("ali@outlok.com"), "ali@outlook.com");
  assert.equal(suggestEmailFix("ali@yahoo.con"), "ali@yahoo.com");
  assert.equal(suggestEmailFix("ali@iclod.com"), "ali@icloud.com");
  assert.equal(suggestEmailFix(" ali@gmial.com "), "ali@gmail.com");
});

test("the student domain and a Turkish ı are put right", () => {
  assert.equal(suggestEmailFix("ali@std.yildz.edu.tr"), "ali@std.yildiz.edu.tr");
  assert.equal(suggestEmailFix("ali@std.yildiz.edu"), "ali@std.yildiz.edu.tr");
  assert.equal(suggestEmailFix("ali@std.yıldız.edu.tr"), "ali@std.yildiz.edu.tr");
  assert.equal(suggestEmailFix("ali@gmaıl.com"), "ali@gmail.com");
});

test(".con and friends become .com on any domain", () => {
  assert.equal(suggestEmailFix("ali@ornek.con"), "ali@ornek.com");
  assert.equal(suggestEmailFix("ali@ornek.cmo"), "ali@ornek.com");
  assert.equal(suggestEmailFix("ali@hotmial.con"), "ali@hotmail.com");
});

test("a right or unknown domain gets no hint", () => {
  for (const address of [
    "ali@gmail.com",
    "Ali@GMAIL.COM",
    "ali@hotmail.com.tr",
    "ali@std.yildiz.edu.tr",
    "ali@yildiz.edu.tr",
    "ali@ornek.com.tr",
    "ali@sirket.io",
    "ali@ornek.cm",
    "ali",
    "@gmial.com",
    "ali@",
    "",
  ]) {
    assert.equal(suggestEmailFix(address), null, address);
  }
});
