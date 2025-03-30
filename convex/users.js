// convex/users.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store or update user data when they log in
export const storeUser = mutation({
  args: {
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("storeUser called with:", args);
    
    try {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .unique();
      
      if (existingUser) {
        console.log("Existing user found:", existingUser);
        
        // If the profile is already complete, don't override firstName and lastName
        const fieldsToUpdate = {
          phoneNumber: args.phoneNumber,
          imageUrl: args.imageUrl || existingUser.imageUrl || "",
        };
        
        // Only update firstName and lastName if they're not already set or profile is not complete
        if (!existingUser.profileComplete) {
          fieldsToUpdate.firstName = args.firstName;
          fieldsToUpdate.lastName = args.lastName;
        }
        
        console.log("Updating user with fields:", fieldsToUpdate);
        await ctx.db.patch(existingUser._id, fieldsToUpdate);
        return existingUser._id;
      } else {
        console.log("Creating new user");
        // Create a new user
        return await ctx.db.insert("users", {
          userId: args.userId,
          firstName: args.firstName,
          lastName: args.lastName,
          phoneNumber: args.phoneNumber,
          imageUrl: args.imageUrl || "",
          licenseNumber: "", // Initialize as empty
          profileComplete: false, // Initialize as incomplete
          role: "user", // Default role is user
          createdAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error in storeUser:", error);
      throw error;
    }
  },
});

// Get user data
export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// New function to check if license number already exists
export const checkLicenseExists = query({
  args: { 
    licenseNumber: v.string(),
    currentUserId: v.string() // Exclude current user from check
  },
  handler: async (ctx, args) => {
    // Skip empty license numbers
    if (!args.licenseNumber || args.licenseNumber.trim() === "") {
      return false;
    }
    
    // Find users with this license number
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("licenseNumber"), args.licenseNumber.trim()))
      .collect();
      
    // If there's a user with this license who is not the current user, return true
    return users.some(user => user.userId !== args.currentUserId);
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    licenseNumber: v.string(),
    licenseImageUrl: v.string(), // Changed from optional to required
    aadharImageUrl: v.string(),  // Changed from optional to required
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Make sure all fields have valid values
    if (!args.firstName || !args.lastName || !args.licenseNumber) {
      throw new Error("First name, last name, and license number are required");
    }
    
    // Check that we have both required document images
    if (!args.licenseImageUrl || !args.aadharImageUrl) {
      throw new Error("Both license and Aadhar card images are required");
    }
        // Check if license number is already used by another user
        if (args.licenseNumber !== user.licenseNumber) {
          const licenseExists = await ctx.db
            .query("users")
            .filter(q => 
              q.and(
                q.eq(q.field("licenseNumber"), args.licenseNumber),
                q.neq(q.field("userId"), args.userId)
              )
            )
            .first();
            
          if (licenseExists) {
            throw new Error("This license number is already registered with another account");
          }
        }
    console.log("Updating user profile with complete data:", {
      userId: args.userId,
      firstName: args.firstName,
      lastName: args.lastName,
      licenseNumber: args.licenseNumber,
      hasLicenseImage: !!args.licenseImageUrl,
      hasAadharImage: !!args.aadharImageUrl
    });
    
    // Update user profile with all required fields
    await ctx.db.patch(user._id, {
      firstName: args.firstName,
      lastName: args.lastName,
      licenseNumber: args.licenseNumber,
      licenseImageUrl: args.licenseImageUrl,
      aadharImageUrl: args.aadharImageUrl,
      profileComplete: true, // Mark as complete since all fields are now required
    });
    
    return user._id;
  },
});

// Check if user profile is complete
export const isProfileComplete = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!user) {
      return false;
    }
    
    // Check for all required fields including the new ones
    return Boolean(
      user.profileComplete === true && 
      user.firstName && 
      user.lastName && 
      user.licenseNumber && 
      user.licenseImageUrl && 
      user.aadharImageUrl &&
      user.aadharBackImageUrl && // Check for Aadhar back image
      user.profilePictureUrl      // Check for profile picture
    );
  },
});

// List all users - Admin only function
export const listUsers = query({
  args: { adminId: v.string() },
  handler: async (ctx, args) => {
    // In a production system, you would verify the admin status here
    // For now, we'll just return all users to make the function work
    // Get all users from the database
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

// Check if a user is admin
export const isAdmin = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    return user?.role === "admin";
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    adminId: v.string(),
    userId: v.string(),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .unique();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update user roles");
    }
    
    // Get the user to update
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update the user's role
    await ctx.db.patch(user._id, {
      role: args.newRole,
    });
    
    return user._id;
  },
});

// Set the first admin - accessible without existing admin
export const setFirstAdmin = mutation({
  args: {
    userId: v.string(),
    setupCode: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real app, this would verify against an environment variable or secure storage
    const ADMIN_SETUP_CODE = "BIKE1234";
    
    if (args.setupCode !== ADMIN_SETUP_CODE) {
      throw new Error("Invalid admin setup code");
    }
    
    // Get the user to update
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if there are any existing admins
    const existingAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    
    // Only allow this route if there are no existing admins
    if (existingAdmins.length > 0) {
      throw new Error("Administrator already exists. This setup can only be used for the first admin.");
    }
    
    // Update the user's role to admin
    await ctx.db.patch(user._id, {
      role: "admin",
    });
    
    return user._id;
  },
});

// Direct update function to bypass validator
export const directUpdateUser = mutation({
  args: {
    userId: v.string(),
    updateData: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      licenseNumber: v.optional(v.string()),
      licenseImageUrl: v.optional(v.string()),
      aadharImageUrl: v.optional(v.string()),
      aadharBackImageUrl: v.optional(v.string()), 
      profilePictureUrl: v.optional(v.string()),
      // Don't include profileComplete in args - we'll compute it
    })
  },
  handler: async (ctx, args) => {
    const { userId, updateData } = args;
    
    console.log("Direct user update called with:", { userId, ...updateData });
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
   // Check if license number is already used by another user when it's changing
   if (updateData.licenseNumber && 
    updateData.licenseNumber !== user.licenseNumber && 
    updateData.licenseNumber.trim() !== "") {
  
  const licenseExists = await ctx.db
    .query("users")
    .filter(q => 
      q.and(
        q.eq(q.field("licenseNumber"), updateData.licenseNumber.trim()),
        q.neq(q.field("userId"), userId)
      )
    )
    .first();
    
  if (licenseExists) {
    throw new Error("This license number is already registered with another account");
  }
}
    // Create a clean updateData object without any unnecessary fields
    const cleanUpdateData = { ...updateData };
    
    // Determine if profile is complete based on required fields
    const isComplete = Boolean(
      cleanUpdateData.firstName && 
      cleanUpdateData.lastName && 
      cleanUpdateData.licenseNumber && 
      cleanUpdateData.licenseImageUrl && 
      cleanUpdateData.aadharImageUrl &&
      cleanUpdateData.aadharBackImageUrl &&
      cleanUpdateData.profilePictureUrl
    );
    
    // Add profileComplete as a separate field with a boolean value
    cleanUpdateData.profileComplete = isComplete;
    
    console.log("Updating user with cleaned data:", cleanUpdateData);
    
    // Apply the updates
    await ctx.db.patch(user._id, cleanUpdateData);
    
    return user._id;
  },
});