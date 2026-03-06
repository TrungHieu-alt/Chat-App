import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  cn,
  normalizeDate,
  requestNotificationPermission,
  showPushNotification,
} from "./utils.js";

const RealDate = Date;
const realNotification = globalThis.Notification;
const realWindow = globalThis.window;

function mockNow(isoString) {
  class MockDate extends RealDate {
    constructor(value) {
      super(value ?? isoString);
    }
    static now() {
      return new RealDate(isoString).getTime();
    }
  }

  globalThis.Date = MockDate;
}

afterEach(() => {
  globalThis.Date = RealDate;

  if (realNotification === undefined) {
    delete globalThis.Notification;
  } else {
    globalThis.Notification = realNotification;
  }

  if (realWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = realWindow;
  }
});

describe("cn", () => {
  it("merges tailwind classes and skips falsy values", () => {
    const classes = cn("p-2", false && "hidden", "p-4", "text-sm");
    assert.equal(classes, "p-4 text-sm");
  });
});

describe("normalizeDate", () => {
  it("returns empty string when input is missing", () => {
    assert.equal(normalizeDate(""), "");
  });

  it("returns Yesterday for dates from one day before", () => {
    mockNow("2026-03-04T12:00:00");
    assert.equal(normalizeDate("2026-03-03T08:00:00"), "Yesterday");
  });

  it("returns weekday for dates in last 7 days", () => {
    mockNow("2026-03-04T12:00:00");
    assert.equal(normalizeDate("2026-03-01T09:00:00"), "Sun");
  });

  it("returns day/month format for dates older than a week", () => {
    mockNow("2026-03-04T12:00:00");
    assert.equal(normalizeDate("2026-02-20T09:00:00"), "20/02");
  });
});

describe("notification helpers", () => {
  it("requests permission when permission is default", () => {
    let called = 0;
    class MockNotification {
      static permission = "default";
      static requestPermission() {
        called += 1;
      }
    }

    globalThis.Notification = MockNotification;

    requestNotificationPermission();
    assert.equal(called, 1);
  });

  it("creates notification and runs click handler when granted", () => {
    const created = [];
    let focused = 0;
    let clicked = 0;

    class MockNotification {
      static permission = "granted";
      constructor(title, options) {
        this.title = title;
        this.options = options;
        this.onclick = null;
        created.push(this);
      }
    }

    globalThis.Notification = MockNotification;
    globalThis.window = { focus: () => focused++ };

    showPushNotification({ title: "Hello", body: "World" }, () => clicked++);

    assert.equal(created.length, 1);
    assert.equal(created[0].title, "Hello");
    assert.equal(created[0].options.body, "World");
    created[0].onclick();
    assert.equal(focused, 1);
    assert.equal(clicked, 1);
  });
});
