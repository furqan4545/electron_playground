#import <Foundation/Foundation.h>
#import <ScreenCaptureKit/ScreenCaptureKit.h>
#include <napi.h>

// Forward declarations
@class CaptureDelegate;

@interface CaptureDelegate : NSObject <SCStreamDelegate>
@property (nonatomic, strong) SCStream *stream;
@property (nonatomic, assign) BOOL isEnabled;
@end

@implementation CaptureDelegate
- (void)stream:(SCStream *)stream didStopWithError:(NSError *)error {
    NSLog(@"Stream stopped with error: %@", error);
}
@end

Napi::Value SetScreenRecordingCursorEnabled(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsBoolean()) {
        Napi::TypeError::New(env, "Boolean argument expected").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    bool enabled = info[0].As<Napi::Boolean>().Value();
    
    @try {
        // Get available content
        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        __block SCShareableContent *shareableContent;
        __block NSError *contentError = nil;
        
        [SCShareableContent getCurrentContentWithCompletionHandler:^(SCShareableContent * _Nullable content, NSError * _Nullable error) {
            shareableContent = content;
            contentError = error;
            dispatch_semaphore_signal(semaphore);
        }];
        
        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
        
        if (contentError) {
            throw [NSException exceptionWithName:@"SCError"
                                       reason:[contentError localizedDescription]
                                     userInfo:nil];
        }
        
        // Create stream configuration
        SCStreamConfiguration *configuration = [[SCStreamConfiguration alloc] init];
        
        // Set cursor visibility
        if (@available(macOS 13.0, *)) {
            [configuration setShowsCursor:enabled];
        }
        
        // Create filter for the display
        SCContentFilter *filter = [[SCContentFilter alloc] initWithDisplay:shareableContent.displays.firstObject 
                                                        excludingWindows:@[]];
        
        // Create delegate
        CaptureDelegate *delegate = [[CaptureDelegate alloc] init];
        delegate.isEnabled = enabled;
        
        // Create stream
        NSError *error = nil;
        SCStream *stream = [[SCStream alloc] initWithFilter:filter 
                                            configuration:configuration 
                                               delegate:delegate 
                                                 error:&error];
        
        if (error) {
            throw [NSException exceptionWithName:@"SCStreamError"
                                       reason:[error localizedDescription]
                                     userInfo:nil];
        }
        
        delegate.stream = stream;
        
        // Start the stream
        dispatch_semaphore_t startSemaphore = dispatch_semaphore_create(0);
        [stream startCaptureWithCompletionHandler:^(NSError * _Nullable startError) {
            if (startError) {
                NSLog(@"Failed to start capture: %@", startError);
            }
            dispatch_semaphore_signal(startSemaphore);
        }];
        
        dispatch_semaphore_wait(startSemaphore, DISPATCH_TIME_FOREVER);
        
        return Napi::Boolean::New(env, true);
    } @catch (NSException *exception) {
        std::string errorMessage = [[exception reason] UTF8String];
        Napi::Error::New(env, errorMessage).ThrowAsJavaScriptException();
        return env.Undefined();
    }
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "setScreenRecordingCursorEnabled"),
                Napi::Function::New(env, SetScreenRecordingCursorEnabled));
    return exports;
}

NODE_API_MODULE(cursor_control, Init)