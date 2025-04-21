const { VertexAI } = require('@google-cloud/vertexai');

async function testVertexAI() {
  try {
    console.log('Testing Vertex AI connection...');
    
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
      universe_domain: 'googleapis.com'
    };

    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: process.env.GOOGLE_LOCATION || 'us-central1',
      googleAuthOptions: { credentials: serviceAccount }
    });

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-pro-exp-03-25'
    });

    console.log('Vertex AI connection successful');
    console.log('Model instance created:', !!model);
    
    // Simple test generation
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    
    console.log('Test generation response:', result.response);
    
  } catch (error) {
    console.error('Vertex AI Test Error:', error);
    process.exit(1);
  }
}

testVertexAI();
