/**
 * Utility to test Socket.IO server availability
 */

export async function testSocketIOServer(serverUrl: string): Promise<boolean> {
  try {
    // Test if the Socket.IO endpoint is available
    const response = await fetch(`${serverUrl}/socket.io/?EIO=4&transport=polling&t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
    });

    // Socket.IO endpoint should return specific response codes
    return response.status === 200 || response.status === 400;
  } catch (error) {
    console.error('❌ Socket.IO server test failed:', error);
    return false;
  }
}

export async function waitForSocketIOServer(
  serverUrl: string, 
  maxAttempts: number = 5, 
  delay: number = 2000
): Promise<boolean> {
  console.log(`🔍 Testing Socket.IO server availability at ${serverUrl}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxAttempts} - Testing server...`);
    
    const isAvailable = await testSocketIOServer(serverUrl);
    
    if (isAvailable) {
      console.log('✅ Socket.IO server is available!');
      return true;
    }
    
    if (attempt < maxAttempts) {
      console.log(`⏳ Server not ready, waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('❌ Socket.IO server is not available after all attempts');
  return false;
} 