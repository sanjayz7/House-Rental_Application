# Modular Components Documentation

This directory contains reusable, modular components for easy integration and deployment.

## Components

### 1. ToastNotification.jsx
A reusable toast notification component for displaying success, error, warning, and info messages.

**Usage:**
```jsx
import ToastNotification from './ToastNotification';

<ToastNotification
  show={show}
  message="Your message here"
  variant="success" // 'success', 'danger', 'warning', 'info'
  onClose={() => setShow(false)}
  duration={5000} // Auto-close duration in ms (0 = no auto-close)
  position="top-right" // 'top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center'
/>
```

**Props:**
- `show` (boolean): Controls visibility
- `message` (string): Message to display
- `variant` (string): Alert type - 'success', 'danger', 'warning', 'info'
- `onClose` (function): Callback when notification is closed
- `duration` (number): Auto-close duration in milliseconds (default: 5000)
- `position` (string): Position on screen (default: 'top-right')

### 2. PropertyInquiryModal.jsx
A modular property inquiry modal component for sending property requests.

**Usage:**
```jsx
import PropertyInquiryModal from './PropertyInquiryModal';

<PropertyInquiryModal
  show={showModal}
  onHide={() => setShowModal(false)}
  property={propertyObject}
  owner={ownerObject}
  user={currentUser}
  requestMessage={message}
  onMessageChange={setMessage}
  onSubmit={handleSubmit}
  loading={isLoading}
/>
```

**Props:**
- `show` (boolean): Controls modal visibility
- `onHide` (function): Callback to close modal
- `property` (object): Property details object
- `owner` (object): Owner details object
- `user` (object): Current user object
- `requestMessage` (string): Current message text
- `onMessageChange` (function): Callback when message changes
- `onSubmit` (function): Callback when form is submitted
- `loading` (boolean): Loading state for submit button

## Theme Configuration

All components use the centralized theme configuration from `../config/theme.js`.

**Usage:**
```jsx
import { theme } from '../config/theme';

// Use theme colors
style={{ background: theme.primary.gradient }}

// Use theme spacing
style={{ borderRadius: theme.borderRadius.md }}
```

## Color Scheme

The application uses a modern purple/blue theme with the following color palette:

- **Primary**: Purple/Blue gradient (#667eea → #764ba2)
- **Success**: Green/Teal gradient (#43e97b → #38f9d7)
- **Warning**: Pink/Yellow gradient (#fa709a → #fee140)
- **Danger**: Red/Orange gradient (#ff6b6b → #ee5a24)
- **Info**: Blue gradient (#4facfe → #00f2fe)

## Integration Guide

### Step 1: Import Components
```jsx
import ToastNotification from './components/ToastNotification';
import PropertyInquiryModal from './components/PropertyInquiryModal';
import { theme } from './config/theme';
```

### Step 2: Use Toast Notifications
```jsx
const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

// Show success
setToast({ show: true, message: 'Operation successful!', variant: 'success' });

// Show error
setToast({ show: true, message: 'Something went wrong!', variant: 'danger' });

// In JSX
<ToastNotification
  show={toast.show}
  message={toast.message}
  variant={toast.variant}
  onClose={() => setToast({ ...toast, show: false })}
/>
```

### Step 3: Use Property Inquiry Modal
```jsx
const [showModal, setShowModal] = useState(false);
const [message, setMessage] = useState('');

<PropertyInquiryModal
  show={showModal}
  onHide={() => setShowModal(false)}
  property={selectedProperty}
  owner={selectedProperty.owner}
  user={currentUser}
  requestMessage={message}
  onMessageChange={setMessage}
  onSubmit={handleSubmitInquiry}
  loading={isSubmitting}
/>
```

## Customization

### Changing Colors
Edit `client/src/config/theme.js` to customize the color scheme:

```javascript
export const theme = {
  primary: {
    main: '#YOUR_COLOR',
    gradient: 'linear-gradient(135deg, #COLOR1 0%, #COLOR2 100%)'
  },
  // ... other colors
};
```

### Modifying Component Styles
Components use inline styles with theme values. To customize:

1. Import theme: `import { theme } from '../config/theme';`
2. Override styles using theme values
3. Or modify component directly for specific use cases

## Deployment

All components are:
- ✅ Self-contained and reusable
- ✅ Theme-aware (uses centralized theme config)
- ✅ Responsive and mobile-friendly
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Type-safe (PropTypes can be added)
- ✅ Performance optimized (memoization ready)

## Best Practices

1. **Always use theme config** instead of hardcoded colors
2. **Keep components focused** - one component, one responsibility
3. **Use ToastNotification** for all user feedback
4. **Handle loading states** in all async operations
5. **Provide fallbacks** for missing data

## Support

For issues or questions, refer to:
- Component source code comments
- Theme configuration file
- Main application implementation in `ShowDetails.jsx`

