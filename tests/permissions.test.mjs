Exit code: 0
Wall time: 2.4 seconds
Output:
import assert from"node:assert/strict";import test from"node:test";import{roleCan}from"../app/permissions.ts";
const all=["admin.access","dashboard.view","posts.read","posts.write","posts.publish","posts.delete","categories.manage","tags.manage","media.manage","homepage.manage","seo.manage","users.manage"];
test("süper yönetici tüm yönetim izinlerine sahiptir",()=>{for(const p of all)assert.equal(roleCan("super_admin",p),true)});
test("yönetici kullanıcı ve rol yönetemez",()=>{assert.equal(roleCan("admin","users.manage"),false);for(const p of["posts.write","categories.manage","media.manage","homepage.manage","seo.manage"])assert.equal(roleCan("admin",p),true)});
test("editör tüm yazıları düzenleyip yayınlayabilir ama site ayarlarını değiştiremez",()=>{for(const p of["posts.read","posts.write","posts.publish","posts.delete"])assert.equal(roleCan("editor",p),true);assert.equal(roleCan("editor","seo.manage"),false);assert.equal(roleCan("editor","users.manage"),false)});
test("yazar yazı oluşturup düzenleyebilir fakat yayınlayamaz ve silemez",()=>{assert.equal(roleCan("author","posts.read"),true);assert.equal(roleCan("author","posts.write"),true);assert.equal(roleCan("author","posts.publish"),false);assert.equal(roleCan("author","posts.delete"),false)});
test("site üyesi ve misafir yönetim izinlerine sahip değildir",()=>{for(const role of["member","guest"])for(const p of all)assert.equal(roleCan(role,p),false)});

