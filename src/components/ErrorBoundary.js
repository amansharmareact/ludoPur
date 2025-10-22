import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

/**
 * Error Boundary Component for React Native
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: Crashlytics.recordError(error);
  }

  handleRestart = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleShowDetails = () => {
    const errorMessage = this.state.error?.message || 'Unknown error';
    const errorStack = this.state.error?.stack || 'No stack trace available';
    
    Alert.alert(
      'Error Details',
      `${errorMessage}\n\nStack Trace:\n${errorStack}`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Don't worry, this happens sometimes!
            </Text>
            
            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, styles.primaryButton]} 
                onPress={this.handleRestart}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.button, styles.secondaryButton]} 
                onPress={this.handleShowDetails}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Show Details
                </Text>
              </Pressable>
            </View>
            
            <Text style={styles.helpText}>
              If this problem persists, please restart the app or contact support.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#e94560',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#e94560',
  },
  helpText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ErrorBoundary;