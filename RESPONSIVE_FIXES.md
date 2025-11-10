# Responsive Design Issues & Fixes

## Current Issues Identified:

1. **Player Panels Overlapping**
   - Fixed positioning with hardcoded `top-20`, `bottom-20` values
   - Fixed width `w-48 md:w-64` too large for small screens
   - No consideration for screen height on phones

2. **Board Sizing**
   - Board doesn't account for UI elements when sizing
   - Fixed positioning causes overlap with player panels
   - No dynamic sizing based on available space

3. **Multiple Fixed Elements**
   - Title, room code, connection status, controls all fixed
   - Competing for limited mobile screen space
   - No priority system for what to show/hide

4. **Game Controls Positioning**
   - Controls at `bottom-2` overlap with player panels
   - Menu buttons at `bottom-24` might not be visible on small screens

## Recommended Fixes:

1. **Use CSS Grid/Flexbox for Layout**
   - Create a proper grid system that adapts to screen size
   - Stack elements vertically on mobile
   - Use relative positioning where possible

2. **Responsive Player Panels**
   - Smaller on mobile: `w-32 sm:w-40 md:w-48 lg:w-64`
   - Stack vertically on very small screens
   - Use bottom sheet or drawer on mobile

3. **Dynamic Board Sizing**
   - Calculate available space after accounting for UI
   - Use `calc()` or viewport units with padding
   - Scale board down on mobile if needed

4. **Collapsible UI Elements**
   - Hide room code in a menu on mobile
   - Collapse connection status to icon only
   - Use hamburger menu for secondary controls

5. **Better Spacing System**
   - Use consistent spacing scale
   - Reduce padding on mobile
   - Add safe area insets for notched devices

