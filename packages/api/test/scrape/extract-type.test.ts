import { describe, assert, expect } from "vitest"
import { webappFixture } from "~test/fixture/codegen-webapp"

describe("extract type", () => {
  webappFixture(
    "extract fields from TgWebApp (checkHomeScreenStatus)",
    ({ webAppPage }) => {
      const t = webAppPage.getType("accelerometer")

      assert(t._tag == "Right" && t.right.type._tag == "EntityFields")

      assert(t.right.type.fields.length == 6)

      const fields = {
        x: t.right.type.fields.find((_) => _.name == "x"),
        y: t.right.type.fields.find((_) => _.name == "y"),
        isStarted: t.right.type.fields.find((_) => _.name == "isStarted"),
        start: t.right.type.fields.find((_) => _.name == "start")
      }

      expect(fields.x?.required).toBeTruthy()
      expect(fields.x?.type.getTsType()).toEqual("number")

      expect(fields.y?.required).toBeTruthy()
      expect(fields.y?.type.getTsType()).toEqual("number")

      expect(fields.isStarted?.required).toBeTruthy()
      expect(fields.isStarted?.type.getTsType()).toEqual("boolean")

      expect(fields.start?.required).toBeTruthy()
      expect(fields.start?.name).toEqual("start")
      expect(fields.start?.type.getTsType()).toEqual(
        "(params: AccelerometerStartParams, callback?: (isStarted: boolean) => void) => Accelerometer"
      )
    }
  )
})
