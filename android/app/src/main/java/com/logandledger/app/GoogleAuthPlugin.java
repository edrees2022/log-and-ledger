package com.logandledger.app;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.NonNull;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "GoogleAuth")
public class GoogleAuthPlugin extends Plugin {
    private static final int RC_SIGN_IN = 9001;
    private static final String TAG = "GoogleAuthPlugin";
    private GoogleSignInClient mGoogleSignInClient;

    @Override
    public void load() {
        // Configure Google Sign-In
        // Use requestServerAuthCode to work around OAuth client issues
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("808599419586-v7kmddvglakat3cq2crhg8j8pecp9eg4.apps.googleusercontent.com")
                .requestServerAuthCode("808599419586-v7kmddvglakat3cq2crhg8j8pecp9eg4.apps.googleusercontent.com", false)
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(getContext(), gso);
        Log.d(TAG, "GoogleAuthPlugin loaded with Server Auth Code");
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        Log.d(TAG, "signIn method called");
        
        if (mGoogleSignInClient == null) {
            Log.e(TAG, "GoogleSignInClient is null!");
            call.reject("GoogleSignInClient not initialized");
            return;
        }
        
        try {
            Intent signInIntent = mGoogleSignInClient.getSignInIntent();
            Log.d(TAG, "Starting sign-in activity with keepAlive");
            // Use keepAlive to preserve the call reference
            call.setKeepAlive(true);
            startActivityForResult(call, signInIntent, RC_SIGN_IN);
        } catch (Exception e) {
            Log.e(TAG, "Error starting sign-in", e);
            call.reject("Error starting sign-in: " + e.getMessage());
        }
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        
        Log.d(TAG, "handleOnActivityResult called - requestCode: " + requestCode + ", resultCode: " + resultCode);

        if (requestCode == RC_SIGN_IN) {
            // Get the saved call from Capacitor
            PluginCall call = getSavedCall();
            
            if (call == null) {
                Log.e(TAG, "Saved call is null - plugin call was lost!");
                return;
            }
            
            if (data == null) {
                Log.e(TAG, "Intent data is null");
                call.reject("Sign-in cancelled or failed - no data returned");
                call.release(getBridge());
                return;
            }
            
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                
                if (account == null) {
                    Log.e(TAG, "Google account is null");
                    call.reject("Sign-in failed - no account returned");
                    call.release(getBridge());
                    return;
                }
                
                Log.d(TAG, "Google Sign-In successful: " + account.getEmail());
                String idToken = account.getIdToken();
                
                if (idToken == null || idToken.isEmpty()) {
                    Log.e(TAG, "ID Token is null or empty!");
                    call.reject("ID Token not received. Please check Firebase Console and google-services.json");
                    call.release(getBridge());
                    return;
                }
                
                Log.d(TAG, "ID Token received (length: " + idToken.length() + ")");

                JSObject result = new JSObject();
                result.put("idToken", idToken);
                result.put("email", account.getEmail());
                result.put("displayName", account.getDisplayName());
                result.put("photoUrl", account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : "");

                call.resolve(result);
                call.release(getBridge());
                Log.d(TAG, "Successfully returned result to JavaScript");
            } catch (ApiException e) {
                Log.e(TAG, "Google Sign-In failed - ApiException code: " + e.getStatusCode(), e);
                call.reject("Sign-in failed: " + e.getMessage() + " (code: " + e.getStatusCode() + ")");
                call.release(getBridge());
            } catch (Exception e) {
                Log.e(TAG, "Google Sign-In failed - Unexpected error", e);
                call.reject("Sign-in failed: " + e.getMessage());
                call.release(getBridge());
            }
        }
    }
}
