# Type System

This directory contains the core entity types used throughout the application. The goal is to have a single source of truth for all entity types, reducing duplication and ensuring consistency.

## Core Types

The `index.ts` file defines the following core entity types:

- `User`: Represents a user in the system
- `Company`: Represents a company/organization
- `Team`: Represents a team within a company
- `BrandGuideline`: Represents a brand guideline
- `BrandRule`: Represents a rule within a brand guideline
- `BrandFile`: Represents a file attached to a brand guideline

## Usage Guidelines

### Importing Types

Always import types from the central types directory:

```typescript
import { User, Company } from "@/types";
```

### Extending Types

If you need to extend a type for a specific feature, use TypeScript's intersection types:

```typescript
import { User } from "@/types";

// Extend the User type with feature-specific properties
type UserWithPreferences = User & {
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
};
```

### Using Partial Types

If you only need a subset of a type's properties, use TypeScript's `Pick` or `Omit` utility types:

```typescript
import { User } from "@/types";

// Only use the id, name, and email properties
type UserBasicInfo = Pick<User, "id" | "name" | "email">;

// Use all properties except sensitive ones
type PublicUser = Omit<User, "password" | "securityQuestions">;
```

## Feature-Specific Types

Feature-specific types should be defined within their respective feature directories. These types should import and extend the core types as needed.

For example, a feature might define form-specific types:

```typescript
// src/features/user-management/types.ts
import { User } from "@/types";

export interface UserFormData {
  name: string;
  email: string;
  role: string;
}

export interface UserUpdateResult {
  user: User;
  success: boolean;
  message?: string;
}
```

## Best Practices

1. **Single Source of Truth**: Always define core entity types in the central types directory
2. **Consistency**: Use consistent naming and structure for all types
3. **Documentation**: Document complex types with JSDoc comments
4. **Type Safety**: Use TypeScript's utility types to ensure type safety
5. **Minimal Duplication**: Avoid duplicating type definitions
