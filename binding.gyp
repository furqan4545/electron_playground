{
  "targets": [
    {
      "target_name": "cursor_control",
      "sources": [ "native/cursor_control.mm" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [
        "NAPI_CPP_EXCEPTIONS"
      ],
      "conditions": [
        ['OS=="mac"', {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "12.3",
            "OTHER_CFLAGS": [
              "-ObjC++"
            ]
          },
          "link_settings": {
            "libraries": [
              "$(SDKROOT)/System/Library/Frameworks/Foundation.framework",
              "$(SDKROOT)/System/Library/Frameworks/ScreenCaptureKit.framework",
              "$(SDKROOT)/System/Library/Frameworks/CoreGraphics.framework"
            ]
          }
        }]
      ]
    }
  ]
}