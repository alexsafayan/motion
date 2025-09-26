## Layout Animation Logic and Coordination in Motion

Based on my exploration of the codebase, here's how layout animations work in Motion:

### Core Architecture

The layout animation system is built around **Projection Nodes** - a separate layer from React components that handles all layout measurements, calculations, and animations. Here are the key locations:

#### 1. **Projection Node System** (`packages/framer-motion/src/projection/`)

**Main coordination logic**: `packages/framer-motion/src/projection/node/create-projection-node.ts`

This is the heart of the layout animation system. Key responsibilities:

- **Layout measurement**: Measures DOM elements' bounding boxes
- **Delta calculation**: Computes the difference between old and new layouts
- **Animation coordination**: Orchestrates the layout animations using transforms
- **Shared layout management**: Handles `layoutId` transitions between components

#### 2. **React Integration** (`packages/framer-motion/src/motion/features/layout/MeasureLayout.tsx`)

This component bridges React lifecycle with the projection system:

- Mounts projection nodes when components with `layout` or `layoutId` mount
- Triggers layout updates via `willUpdate()` and `didUpdate()`
- Manages component presence for shared layout animations

### Layout Animation Flow

#### For `<motion.div layout />`:

1. **Mount**: Component creates a projection node via `createProjectionNode()`
2. **Snapshot**: Before layout changes, takes a "snapshot" of current position/size
3. **Layout Update**: After re-render, measures new layout position/size  
4. **Delta Calculation**: Computes the difference (delta) between old and new layout
5. **Transform Animation**: Animates using CSS transforms to bridge the gap

```typescript
// Key update cycle (simplified)
1. willUpdate() -> takes snapshot
2. didUpdate() -> measures new layout 
3. notifyLayoutUpdate() -> calculates delta and starts animation
4. startAnimation() -> animates transforms to new position
```

#### For `<motion.li layoutId="item" />`:

Uses the **NodeStack system** (`packages/framer-motion/src/projection/shared/stack.ts`) for shared layout animations:

1. **Registration**: Elements with same `layoutId` register with shared node stack
2. **Lead/Follow**: One element becomes the "lead" (visible), others become "followers" (hidden)
3. **Handoff**: When layout changes, new element becomes lead and inherits animation state from previous
4. **Crossfade**: Optional crossfading between old and new elements

### Key Coordination Mechanisms

#### 1. **Global Update Cycle** 
```typescript:2062:2187:packages/framer-motion/src/projection/node/create-projection-node.ts
// The main update cycle runs in batches:
// 1. Reset transforms
// 2. Measure all layouts  
// 3. Notify layout updates (triggers animations)
```

#### 2. **Shared Node Management**
```typescript:1762:1778:packages/framer-motion/src/projection/node/create-projection-node.ts
// Elements with same layoutId share a NodeStack
registerSharedNode(layoutId: string, node: IProjectionNode) {
    if (!this.sharedNodes.has(layoutId)) {
        this.sharedNodes.set(layoutId, new NodeStack())
    }
    const stack = this.sharedNodes.get(layoutId)!
    stack.add(node)
    // Promotes node to lead position
}
```

#### 3. **Animation Decision Logic**
```typescript:547:577:packages/framer-motion/src/projection/node/create-projection-node.ts
// Decides whether to animate based on:
// - Layout root status
// - Whether resuming from another element  
// - Layout changes detected
if (
    this.options.layoutRoot ||
    this.resumeFrom ||
    hasOnlyRelativeTargetChanged ||
    (hasLayoutChanged && (hasTargetChanged || !this.currentAnimation))
) {
    this.startAnimation(animationOptions)
}
```

### Performance Optimizations

- **FLIP technique**: Uses transforms instead of changing layout properties directly
- **Batched updates**: All measurements happen together to avoid layout thrashing
- **Scale correction**: Automatically corrects visual distortions on children elements
- **Reduced motion**: Respects user's motion preferences

### Entry Points

The layout props get processed in:
- **Props interface**: `packages/motion-dom/src/node/types.ts` (lines 872-969)
- **React integration**: `packages/framer-motion/src/motion/utils/use-visual-element.ts` (createProjectionNode)
- **Component creation**: `packages/framer-motion/src/motion/index.tsx` (useLayoutId hook)

This system enables smooth layout animations by measuring DOM changes and using performant CSS transforms to animate between states, while the shared layout system allows seamless transitions of elements with the same `layoutId` across different locations in the component tree.