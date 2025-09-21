# Credation Website Implementation Plan with shadcn/ui Components

## Overview
This document outlines the implementation plan for the Credation student certificate management platform using shadcn/ui components. The application follows the MVP specifications from the PRD and architecture documents.

## Required shadcn/ui Components

### Core UI Components
- `button` - Primary actions, form submissions, approve/reject actions
- `card` - Dashboard summary cards, certificate display cards
- `form` - Login forms, certificate upload forms
- `input` - Text inputs for forms
- `textarea` - Rejection reason input
- `select` - Dropdown for certificate categories
- `table` - Certificate listings for students and faculty
- `tabs` - Student navigation (Dashboard, Activities, Approvals)
- `badge` - Status indicators (pending, approved, rejected, blockchain verified)
- `alert` - Success/error messages, notifications
- `dialog` - Certificate preview modal, confirmation dialogs
- `avatar` - User profile display
- `separator` - Visual separation between sections
- `skeleton` - Loading states
- `progress` - File upload progress
- `toast` (sonner) - Notifications and feedback

### Block Components (Pre-built Layouts)
- `login-01` - Simple login form for authentication
- `dashboard-01` - Dashboard layout with sidebar and main content area
- `data-table-demo` - Data table implementation for certificate listings

### Form Components
- `label` - Form field labels
- `checkbox` - Terms acceptance, bulk selection
- `radio-group` - User role selection during registration

## Page Structure and Components

### 1. Authentication Pages

#### Login Page (`/login`)
**Components Used:**
- `login-01` block as base
- `form` for form validation
- `input` for email/password
- `button` for submit action
- `alert` for error messages
- `card` for form container

**Features:**
- Email/password authentication via Supabase
- Role-based redirect (student → dashboard, faculty → review)
- Form validation and error handling
- Remember me functionality

#### Registration Page (`/register`) - Future Enhancement
**Components Used:**
- `form` with validation
- `input` for user details
- `select` for role selection
- `checkbox` for terms acceptance
- `button` for registration

### 2. Student Pages

#### Student Dashboard (`/dashboard`)
**Components Used:**
- `dashboard-01` block as layout foundation
- `card` for summary statistics (Credits, Attendance %, Projects, Courses)
- `table` for approved certificates list
- `badge` for certificate status and blockchain verification
- `tabs` for navigation (Dashboard, Activities, Approvals)
- `avatar` for user profile
- `separator` for section divisions

**Dashboard Summary Cards:**
```tsx
// Using card component for each metric
<Card>
  <CardHeader>
    <CardTitle>Credits Earned</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{credits}</div>
  </CardContent>
</Card>
```

#### Activities Tab (`/dashboard?tab=activities`)
**Components Used:**
- `form` for certificate upload
- `input` for title, issuer, issue date
- `select` for category selection
- `textarea` for description
- `button` for file selection and form submission
- `progress` for upload progress
- `alert` for upload status messages

**Certificate Upload Form:**
```tsx
<Form>
  <FormField name="title" render={({ field }) => (
    <FormItem>
      <FormLabel>Certificate Title</FormLabel>
      <FormControl>
        <Input placeholder="Enter certificate title" {...field} />
      </FormControl>
    </FormItem>
  )} />
  // Additional fields...
  <Button type="submit">Upload Certificate</Button>
</Form>
```

#### Approvals Tab (`/dashboard?tab=approvals`)
**Components Used:**
- `table` for pending/rejected certificates list
- `badge` for status indicators
- `dialog` for certificate preview
- `button` for actions (view, edit, resubmit)

### 3. Faculty Pages

#### Faculty Review Dashboard (`/faculty`)
**Components Used:**
- `dashboard-01` block layout
- `data-table-demo` as base for certificate review table
- `table` for pending certificates listing
- `button` for approve/reject actions
- `dialog` for certificate detail view
- `textarea` for rejection reasons
- `badge` for status display
- `alert` for action confirmations

**Pending Certificates Table:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Student</TableHead>
      <TableHead>Certificate</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>Submitted</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {certificates.map((cert) => (
      <TableRow key={cert.id}>
        <TableCell>{cert.student_name}</TableCell>
        <TableCell>{cert.title}</TableCell>
        <TableCell>
          <Badge variant="outline">{cert.category}</Badge>
        </TableCell>
        <TableCell>{cert.submitted_at}</TableCell>
        <TableCell>
          <Button size="sm" onClick={() => handleApprove(cert.id)}>
            Approve
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleReject(cert.id)}>
            Reject
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Component Implementation Strategy

### 1. Setup Phase
```bash
# Install required shadcn/ui components
npx shadcn@latest add button card form input textarea select table tabs badge alert dialog avatar separator skeleton progress sonner label checkbox radio-group

# Add block components
npx shadcn@latest add login-01 dashboard-01 data-table-demo
```

### 2. Layout Components

#### Main Layout (`/src/components/Layout.tsx`)
**Components Used:**
- `sidebar` for navigation
- `avatar` for user profile
- `button` for logout
- `separator` for visual separation

#### Navigation Sidebar
**Components Used:**
- Navigation menu with role-based visibility
- User profile section with avatar
- Logout functionality

### 3. Feature-Specific Components

#### Certificate Card (`/src/components/CertificateCard.tsx`)
**Components Used:**
- `card` as container
- `badge` for status and blockchain verification
- `button` for actions (view, download)
- `dialog` for detailed view

#### Upload Component (`/src/components/CertificateUpload.tsx`)
**Components Used:**
- `form` with validation
- `input` for file selection
- `progress` for upload status
- `alert` for feedback

#### Status Badge (`/src/components/StatusBadge.tsx`)
**Components Used:**
- `badge` with dynamic variants based on status
- Color coding: pending (yellow), approved (green), rejected (red)

## Data Integration Patterns

### 1. Supabase Integration
```tsx
// Using form with Supabase
const form = useForm<CertificateForm>({
  resolver: zodResolver(certificateSchema),
})

const onSubmit = async (data: CertificateForm) => {
  // Upload file to Supabase Storage
  const { data: fileData, error: uploadError } = await supabase.storage
    .from('certificates')
    .upload(`${user.id}/${uuid()}.pdf`, file)

  // Insert certificate record
  const { error } = await supabase
    .from('certificates')
    .insert({
      student_id: user.id,
      title: data.title,
      file_path: fileData?.path,
      status: 'pending'
    })
}
```

### 2. Real-time Updates
```tsx
// Using Supabase Realtime with shadcn components
useEffect(() => {
  const subscription = supabase
    .channel('certificates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'certificates',
      filter: `student_id=eq.${user.id}`
    }, (payload) => {
      // Update UI with toast notification
      toast({
        title: "Certificate Status Updated",
        description: `Your certificate "${payload.new.title}" has been ${payload.new.status}`,
      })
    })
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

## Responsive Design Strategy

### Mobile-First Approach
- Use shadcn's responsive variants
- Collapse sidebar on mobile using `sheet` component
- Stack cards vertically on small screens
- Use `drawer` instead of `dialog` on mobile

### Breakpoint Strategy
- Mobile: Stack all components vertically
- Tablet: 2-column layout for dashboard cards
- Desktop: Full layout with sidebar

## Accessibility Features

### Built-in Accessibility
- All shadcn components follow WAI-ARIA guidelines
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Custom Accessibility Enhancements
- Skip navigation links
- Proper heading hierarchy
- Alt text for certificate images
- Error announcements for screen readers

## Performance Optimizations

### Component Loading
- Lazy load certificate preview dialogs
- Use `skeleton` components during data loading
- Implement virtual scrolling for large certificate lists

### File Upload Optimization
- Show `progress` component during uploads
- Implement chunked uploads for large files
- Preview files before upload

## Implementation Timeline

### Phase 1: Core Components (Week 1)
- [ ] Set up shadcn/ui in Next.js project
- [ ] Implement authentication pages using `login-01`
- [ ] Create basic layout with sidebar navigation
- [ ] Implement student dashboard with summary cards

### Phase 2: Student Features (Week 2)
- [ ] Implement certificate upload form
- [ ] Create approvals tab with status table
- [ ] Add certificate preview dialog
- [ ] Implement file upload with progress

### Phase 3: Faculty Features (Week 3)
- [ ] Create faculty review dashboard
- [ ] Implement certificate approval/rejection flow
- [ ] Add bulk actions for certificate processing
- [ ] Implement real-time updates

### Phase 4: Polish & Testing (Week 4)
- [ ] Add loading states and skeleton components
- [ ] Implement responsive design
- [ ] Add toast notifications
- [ ] Performance optimization and testing

## Component Dependencies

### Installation Commands
```bash
# Essential UI components
npx shadcn@latest add button card form input textarea select table tabs badge alert dialog avatar separator skeleton progress sonner label checkbox radio-group

# Layout blocks
npx shadcn@latest add dashboard-01 login-01

# Data components
npx shadcn@latest add data-table-demo

# Additional utilities
npx shadcn@latest add hover-card tooltip popover sheet drawer
```

### Custom Component Extensions
- Enhanced file upload component with drag-and-drop
- Certificate preview component with PDF rendering
- Advanced data table with filtering and sorting
- Role-based navigation component

## Security Considerations

### Form Validation
- Use Zod schemas with shadcn form components
- Client-side validation with server-side verification
- Sanitize file uploads and metadata

### Access Control
- Role-based component rendering
- Protected routes with authentication checks
- Supabase RLS policy enforcement

## Testing Strategy

### Component Testing
- Unit tests for custom components
- Integration tests for form submissions
- Accessibility testing with testing-library

### User Flow Testing
- E2E tests for critical paths
- Cross-browser compatibility
- Mobile responsiveness testing

This implementation plan provides a comprehensive roadmap for building the Credation platform using shadcn/ui components while maintaining the requirements specified in the PRD and architecture documents.