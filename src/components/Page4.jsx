import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page4.css';

// Generate the same music data and TAGGSS as Page3
const generateMusicData = () => {
  const artists = [
    'The Weeknd', 'Taylor Swift', 'Drake', 'Billie Eilish', 'Post Malone',
    'Ariana Grande', 'Ed Sheeran', 'Dua Lipa', 'Justin Bieber', 'The Chainsmokers',
    'Imagine Dragons', 'Coldplay', 'Maroon 5', 'Bruno Mars', 'Adele',
    'Eminem', 'Kanye West', 'Travis Scott', 'Kendrick Lamar', 'J. Cole',
    'BTS', 'Blackpink', 'Lana Del Rey', 'Lorde', 'SZA',
    'Doja Cat', 'Olivia Rodrigo', 'Harry Styles', 'Bad Bunny', 'J Balvin',
    'The Beatles', 'Queen', 'Led Zeppelin', 'Pink Floyd', 'Radiohead',
    'Arctic Monkeys', 'Tame Impala', 'Glass Animals', 'MGMT', 'Foster the People'
  ];

  const musicNames = [
    'Midnight Dreams', 'Electric Nights', 'Ocean Waves', 'City Lights', 'Starry Sky',
    'Golden Hour', 'Sunset Boulevard', 'Neon Dreams', 'Crystal Clear', 'Velvet Touch',
    'Moonlight Sonata', 'Thunder Road', 'Silent Storm', 'Dancing Shadows', 'Echo Chamber',
    'Digital Love', 'Cosmic Dance', 'Neon Nights', 'Starlight Express', 'Midnight Run',
    'Electric Pulse', 'Sound Waves', 'Rhythm Nation', 'Beat Drop', 'Bass Line',
    'Melody Lane', 'Harmony Street', 'Chord Progress', 'Note Perfect', 'Tune In',
    'Frequency Shift', 'Wave Length', 'Sound Check', 'Audio File', 'Track Record',
    'Playlist Mix', 'Album Art', 'Cover Song', 'Original Mix', 'Remix Version',
    'Live Session', 'Studio Take', 'Demo Track', 'Final Cut', 'Bonus Track',
    'Hidden Gem', 'Deep Cut', 'B-Side', 'Rare Find', 'Classic Hit',
    'New Release', 'Fresh Drop', 'Hot Track', 'Top Chart', 'Hit Single',
    'Summer Vibes', 'Winter Blues', 'Spring Fever', 'Autumn Leaves', 'Seasonal Mix',
    'Party Anthem', 'Chill Beats', 'Workout Mix', 'Study Playlist', 'Road Trip',
    'Late Night', 'Early Morning', 'Afternoon Delight', 'Evening Drive', 'Night Shift',
    'Feel Good', 'Mood Booster', 'Energy Boost', 'Relax Mode', 'Focus Time',
    'Dance Floor', 'Club Banger', 'House Party', 'Rave Ready', 'Festival Mix',
    'Acoustic Session', 'Unplugged', 'Live Performance', 'Concert Hall', 'Intimate Set',
    'Electronic Beat', 'Synth Wave', 'Retro Future', 'Cyber Punk', 'Neon Pop',
    'Soulful Sound', 'Jazz Fusion', 'Blues Rock', 'Funk Groove', 'R&B Smooth',
    'Hip Hop Flow', 'Rap Verse', 'Trap Beat', 'Drill Sound', 'Boom Bap'
  ];

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Blues', 'Country',
    'Classical', 'Reggae', 'Funk', 'Soul', 'Indie', 'Alternative', 'Metal',
    'Punk', 'Folk', 'Gospel', 'Latin', 'K-Pop', 'EDM', 'House', 'Techno',
    'Dubstep', 'Trap', 'Drill', 'Lo-Fi', 'Ambient', 'Synthwave', 'Disco'
  ];

  const moods = [
    'Energetic', 'Calm', 'Happy', 'Sad', 'Romantic', 'Aggressive', 'Melancholic',
    'Uplifting', 'Dark', 'Bright', 'Intense', 'Relaxed', 'Nostalgic', 'Futuristic',
    'Dreamy', 'Powerful', 'Gentle', 'Bold', 'Mysterious', 'Playful', 'Serious',
    'Euphoric', 'Chill', 'Passionate', 'Peaceful', 'Rebellious', 'Hopeful', 'Moody'
  ];

  const colors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black',
    'White', 'Gray', 'Brown', 'Cyan', 'Magenta', 'Gold', 'Silver', 'Violet',
    'Indigo', 'Turquoise', 'Coral', 'Lavender', 'Maroon', 'Navy', 'Teal',
    'Olive', 'Crimson', 'Amber', 'Emerald', 'Sapphire', 'Ruby', 'Pearl'
  ];

  const DATA = [];
  const TAGGSS = [];
  
  for (let i = 0; i < 100; i++) {
    const artist = artists[Math.floor(Math.random() * artists.length)];
    const musicName = musicNames[Math.floor(Math.random() * musicNames.length)];
    const imageUrl = `https://picsum.photos/seed/music${i}/300/300`;
    
    // Generate 1-3 random tags
    const numTags = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    const tagTypes = ['genre', 'mood', 'color'];
    const tags = [];
    
    // Shuffle tag types and pick random ones
    const shuffledTypes = tagTypes.sort(() => Math.random() - 0.5);
    
    for (let j = 0; j < numTags; j++) {
      const tagType = shuffledTypes[j];
      let tagValue;
      
      if (tagType === 'genre') {
        tagValue = genres[Math.floor(Math.random() * genres.length)];
      } else if (tagType === 'mood') {
        tagValue = moods[Math.floor(Math.random() * moods.length)];
      } else {
        tagValue = colors[Math.floor(Math.random() * colors.length)];
      }
      
      tags.push({
        type: tagType,
        value: tagValue
      });
    }
    
    const musicEntry = {
      id: i + 1,
      name: musicName,
      artist: artist,
      image: imageUrl,
      tags: tags
    };
    
    DATA.push(musicEntry);
    TAGGSS.push(...tags);
  }
  
  return { DATA, TAGGSS };
};

function Page4() {
  const navigate = useNavigate();
  
  // Load DATTAA and TAGGSS from localStorage or generate if not exists
  const { DATTAA, TAGGSS } = useMemo(() => {
    const storedDATTAA = localStorage.getItem('DATTAA');
    const storedTAGGSS = localStorage.getItem('TAGGSS');
    
    if (storedDATTAA && storedTAGGSS) {
      try {
        return {
          DATTAA: JSON.parse(storedDATTAA),
          TAGGSS: JSON.parse(storedTAGGSS)
        };
      } catch (error) {
        console.error('Error parsing stored data:', error);
        const { DATA, TAGGSS: newTAGGSS } = generateMusicData();
        localStorage.setItem('DATTAA', JSON.stringify(DATA));
        localStorage.setItem('TAGGSS', JSON.stringify(newTAGGSS));
        return { DATTAA: DATA, TAGGSS: newTAGGSS };
      }
    } else {
      const { DATA, TAGGSS: newTAGGSS } = generateMusicData();
      localStorage.setItem('DATTAA', JSON.stringify(DATA));
      localStorage.setItem('TAGGSS', JSON.stringify(newTAGGSS));
      return { DATTAA: DATA, TAGGSS: newTAGGSS };
    }
  }, []);

  // Use DATTAA instead of DATA
  const DATA = DATTAA || [];
  
  // State to track bubbles in canvas
  const [canvasBubbles, setCanvasBubbles] = useState([]);
  const [musicBubbles, setMusicBubbles] = useState([]); // Music bubbles around tags
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedCanvasBubbleId, setDraggedCanvasBubbleId] = useState(null);
  const [isReturning, setIsReturning] = useState(null);
  const [isDraggingOverCanvas, setIsDraggingOverCanvas] = useState(false);
  const tagRefs = useRef({});
  const canvasRef = useRef(null);
  const canvasBubbleRefs = useRef({});
  const animationFrameRef = useRef(null);
  const musicBubbleVelocities = useRef({}); // Store velocities for physics
  const musicBubbleAccelerations = useRef({}); // Store accelerations for realistic physics
  const musicBubbleTargets = useRef({}); // Store smoothed target positions
  const targetUpdateCounter = useRef(0); // Counter to throttle target updates
  const canvasBubblesRef = useRef([]); // Ref to track current canvas bubbles
  const musicBubblesRef = useRef([]); // Ref to track current music bubbles
  const musicBubbleDragStateRef = useRef({ isDragging: false, draggedId: null }); // Ref for music bubble drag state

  const dragStateRef = useRef({ index: null, dropped: false, type: null }); // type: 'list' or 'canvas'

  // Find all tag bubbles in canvas that match a music entry's tags
  const findMatchingTagBubbles = (music) => {
    return canvasBubbles.filter(tagBubble => 
      music.tags.some(musicTag => 
        musicTag.value === tagBubble.tag.value && 
        musicTag.type === tagBubble.tag.type
      )
    );
  };

  // Check if a music entry should have a bubble (has at least one tag in canvas)
  const shouldShowMusicBubble = (music) => {
    return canvasBubbles.some(tagBubble =>
      music.tags.some(musicTag =>
        musicTag.value === tagBubble.tag.value &&
        musicTag.type === tagBubble.tag.type
      )
    );
  };

  // Calculate combined target position from all matching tag bubbles
  const calculateCombinedTargetPosition = (music, matchingTagBubbles) => {
    if (matchingTagBubbles.length === 0) return null;

    // If only one tag, position around it
    if (matchingTagBubbles.length === 1) {
      const tagBubble = matchingTagBubbles[0];
      const radius = 120;
      // Find index of this music among all music with this tag
      const allMusicWithTag = DATA.filter(m => 
        m.tags.some(t => 
          t.value === tagBubble.tag.value && t.type === tagBubble.tag.type
        )
      );
      const index = allMusicWithTag.findIndex(m => m.id === music.id);
      const angle = (index * 2 * Math.PI) / Math.max(allMusicWithTag.length, 1);
      return {
        x: tagBubble.x + radius * Math.cos(angle),
        y: tagBubble.y + radius * Math.sin(angle)
      };
    }

    // If multiple tags, position at center of mass
    let sumX = 0;
    let sumY = 0;
    matchingTagBubbles.forEach(tagBubble => {
      sumX += tagBubble.x;
      sumY += tagBubble.y;
    });
    return {
      x: sumX / matchingTagBubbles.length,
      y: sumY / matchingTagBubbles.length
    };
  };

  // Update refs when bubbles change
  useEffect(() => {
    canvasBubblesRef.current = canvasBubbles;
  }, [canvasBubbles]);

  useEffect(() => {
    musicBubblesRef.current = musicBubbles;
  }, [musicBubbles]);

  // Update music bubbles when canvas bubbles change (tags added/removed)
  useEffect(() => {
    // Update canvas bubbles ref first
    canvasBubblesRef.current = canvasBubbles;
    
    setMusicBubbles(prev => {
      const existingMusicIds = new Set(prev.map(mb => mb.music.id));
      const newMusicBubbles = [];
      const musicBubblesToKeep = [];
      
      // Check existing music bubbles - keep if still should be shown
      prev.forEach(mb => {
        if (shouldShowMusicBubble(mb.music)) {
          musicBubblesToKeep.push(mb);
        } else {
          // Remove if no longer has matching tags
          delete musicBubbleVelocities.current[mb.id];
        }
      });
      
      // Check all music in DATTAA for new bubbles
      DATA.forEach(music => {
        if (existingMusicIds.has(music.id)) return; // Already exists
        
        if (shouldShowMusicBubble(music)) {
          const matchingTags = findMatchingTagBubbles(music);
          if (matchingTags.length > 0) {
            const targetPos = calculateCombinedTargetPosition(music, matchingTags);
            if (targetPos) {
              const startX = matchingTags[0].x + (Math.random() - 0.5) * 200;
              const startY = matchingTags[0].y + (Math.random() - 0.5) * 200;
              
              newMusicBubbles.push({
                id: `music-${music.id}`,
                music: music,
                x: startX,
                y: startY,
                targetX: targetPos.x,
                targetY: targetPos.y
              });
              
              musicBubbleVelocities.current[`music-${music.id}`] = { vx: 0, vy: 0 };
            }
          }
        }
      });
      
      return [...musicBubblesToKeep, ...newMusicBubbles];
    });
  }, [canvasBubbles, DATA]);

  // Physics simulation: Music bubbles constantly follow their tag bubbles
  useEffect(() => {
    let isRunning = true;

    const physicsStep = () => {
      if (!isRunning) return;

      const currentMusicBubbles = musicBubblesRef.current;
      const currentCanvasBubbles = canvasBubblesRef.current;
      
      if (currentMusicBubbles.length === 0 || currentCanvasBubbles.length === 0) {
        if (currentMusicBubbles.length === 0) {
          isRunning = false;
        }
        if (isRunning) {
          animationFrameRef.current = requestAnimationFrame(physicsStep);
        }
        return;
      }

      setMusicBubbles(prev => {
        if (prev.length === 0) return prev;

        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return prev;

        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;
        const bubbleRadius = 30;

        return prev.map(musicBubble => {
          // Skip physics if this bubble is being dragged (check ref for current state)
          if (musicBubbleDragStateRef.current.isDragging && 
              musicBubbleDragStateRef.current.draggedId === musicBubble.id) {
            return musicBubble;
          }

          // Always get fresh tag bubbles from ref (updated in real-time during drag)
          const matchingTagBubbles = currentCanvasBubbles.filter(tagBubble =>
            musicBubble.music.tags.some(musicTag =>
              musicTag.value === tagBubble.tag.value &&
              musicTag.type === tagBubble.tag.type
            )
          );

          if (matchingTagBubbles.length === 0) return musicBubble;

          // Update target position less frequently for smoother movement
          // Only recalculate target every 5 frames (throttle target detection)
          const targetUpdateInterval = 5;
          targetUpdateCounter.current = (targetUpdateCounter.current || 0) + 1;
          
          let targetX, targetY;
          
          // Initialize or get existing smoothed target
          if (!musicBubbleTargets.current[musicBubble.id]) {
            musicBubbleTargets.current[musicBubble.id] = { x: musicBubble.x, y: musicBubble.y };
          }
          const smoothedTarget = musicBubbleTargets.current[musicBubble.id];
          
          // Only recalculate target position every N frames
          if (targetUpdateCounter.current % targetUpdateInterval === 0) {
            let newTargetX, newTargetY;
            
            if (matchingTagBubbles.length === 1) {
              // Single tag: just try to get as close as possible, no fixed position
              const tagBubble = matchingTagBubbles[0];
              const minDistance = bubbleRadius + 40; // Minimum distance to prevent overlap
              
              // Calculate direction from current position to tag
              const dx = tagBubble.x - musicBubble.x;
              const dy = tagBubble.y - musicBubble.y;
              const currentDist = Math.sqrt(dx * dx + dy * dy);
              
              if (currentDist > minDistance) {
                // Move toward tag, stopping at minimum distance
                const angle = Math.atan2(dy, dx);
                newTargetX = tagBubble.x - minDistance * Math.cos(angle);
                newTargetY = tagBubble.y - minDistance * Math.sin(angle);
              } else {
                // Already at minimum distance, maintain it
                if (currentDist > 0) {
                  newTargetX = tagBubble.x - minDistance * (dx / currentDist);
                  newTargetY = tagBubble.y - minDistance * (dy / currentDist);
                } else {
                  // Fallback if at exact same position
                  newTargetX = tagBubble.x;
                  newTargetY = tagBubble.y + minDistance;
                }
              }
            } else {
              // Multiple tags: position at center of mass, but allow free movement
              let sumX = 0, sumY = 0;
              matchingTagBubbles.forEach(tagBubble => {
                sumX += tagBubble.x;
                sumY += tagBubble.y;
              });
              const centerX = sumX / matchingTagBubbles.length;
              const centerY = sumY / matchingTagBubbles.length;
              
              // Try to get close to center, but allow natural positioning
              const minDistance = bubbleRadius + 40;
              const dx = centerX - musicBubble.x;
              const dy = centerY - musicBubble.y;
              const currentDist = Math.sqrt(dx * dx + dy * dy);
              
              if (currentDist > minDistance) {
                // Move toward center
                newTargetX = centerX;
                newTargetY = centerY;
              } else {
                // Close enough, maintain minimum distance from center
                if (currentDist > 0) {
                  const angle = Math.atan2(dy, dx);
                  newTargetX = centerX - minDistance * Math.cos(angle);
                  newTargetY = centerY - minDistance * Math.sin(angle);
                } else {
                  newTargetX = centerX;
                  newTargetY = centerY + minDistance;
                }
              }
            }

            // Keep target within canvas bounds
            newTargetX = Math.max(bubbleRadius, Math.min(canvasWidth - bubbleRadius, newTargetX));
            newTargetY = Math.max(bubbleRadius, Math.min(canvasHeight - bubbleRadius, newTargetY));
            
            // Smoothly interpolate to new target (gradual transition)
            const targetSmoothing = 0.15; // How quickly target updates (lower = smoother)
            smoothedTarget.x += (newTargetX - smoothedTarget.x) * targetSmoothing;
            smoothedTarget.y += (newTargetY - smoothedTarget.y) * targetSmoothing;
          }
          
          // Use smoothed target for physics calculations
          targetX = smoothedTarget.x;
          targetY = smoothedTarget.y;

          // Initialize velocity and acceleration
          if (!musicBubbleVelocities.current[musicBubble.id]) {
            musicBubbleVelocities.current[musicBubble.id] = { vx: 0, vy: 0 };
          }
          if (!musicBubbleAccelerations.current[musicBubble.id]) {
            musicBubbleAccelerations.current[musicBubble.id] = { ax: 0, ay: 0 };
          }
          const vel = musicBubbleVelocities.current[musicBubble.id];
          const acc = musicBubbleAccelerations.current[musicBubble.id];

          // Calculate attraction force - with forgiving positioning to prevent shaking
          const dx = targetX - musicBubble.x;
          const dy = targetY - musicBubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Dead zone - if very close, reduce movement significantly (more forgiving)
          const deadZone = 45; // Distance where bubble is considered "close enough" (3x larger)
          const minDistanceThreshold = 9; // Minimum distance to apply any force (3x larger)
          
          // Mass for realistic physics (affects acceleration)
          const mass = 1.0; // Unit mass

          if (distance > minDistanceThreshold) {
            // Dynamic attraction based on distance (weaker when close)
            let forceStrength, damping, maxSpeed;
            
            if (distance < deadZone) {
              // Very close - very weak attraction, high damping to prevent shaking
              forceStrength = 0.033; // 3x slower (0.1 / 3)
              damping = 0.92; // Higher damping when close
              maxSpeed = 1; // 3x slower (3 / 3)
            } else if (distance < deadZone * 2) {
              // Moderately close - moderate attraction
              forceStrength = 0.083; // 3x slower (0.25 / 3)
              damping = 0.88;
              maxSpeed = 2.67; // 3x slower (8 / 3)
            } else {
              // Far away - strong attraction
              forceStrength = 0.133; // 3x slower (0.4 / 3)
              damping = 0.85;
              maxSpeed = 4; // 3x slower (12 / 3)
            }

            // Calculate attraction force toward target (proportional to distance)
            const forceX = (dx / distance) * forceStrength * distance;
            const forceY = (dy / distance) * forceStrength * distance;

            // Realistic physics: Force -> Acceleration -> Velocity -> Position
            // Start with attraction force
            acc.ax = forceX / mass;
            acc.ay = forceY / mass;

            // Collision detection with other music bubbles (predictive, before velocity update)
            // Check collisions at predicted position based on current velocity
            const predictedX = musicBubble.x + vel.vx;
            const predictedY = musicBubble.y + vel.vy;
            
            prev.forEach(otherBubble => {
              if (otherBubble.id === musicBubble.id) return; // Skip self
              
              const dx = predictedX - otherBubble.x;
              const dy = predictedY - otherBubble.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const minDist = bubbleRadius * 2; // Minimum distance (diameter)
              
              // More forgiving collision detection (larger tolerance)
              const collisionTolerance = bubbleRadius * 2.2; // 10% more forgiving
              if (dist < collisionTolerance && dist > 0) {
                // Collision detected - apply repulsion force as acceleration (3x slower)
                const collisionForce = 0.1; // 3x slower (0.3 / 3)
                acc.ax += (dx / dist) * collisionForce;
                acc.ay += (dy / dist) * collisionForce;
              }
            });
            
            // Update velocity with all accumulated accelerations (attraction + collisions)
            vel.vx += acc.ax;
            vel.vy += acc.ay;
            
            // Apply damping for smooth motion (air resistance)
            vel.vx *= damping;
            vel.vy *= damping;

            // Limit speed (terminal velocity)
            const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
            if (speed > maxSpeed) {
              vel.vx = (vel.vx / speed) * maxSpeed;
              vel.vy = (vel.vy / speed) * maxSpeed;
            }
            
            // Stop micro-movements (if velocity is very small, stop it) - more forgiving threshold
            if (Math.abs(vel.vx) < 0.033 && Math.abs(vel.vy) < 0.033 && distance < deadZone) {
              vel.vx = 0;
              vel.vy = 0;
              acc.ax = 0;
              acc.ay = 0;
            }

            // Update position with velocity (realistic motion)
            let newX = musicBubble.x + vel.vx;
            let newY = musicBubble.y + vel.vy;
            
            // Final collision correction (push apart if still overlapping after movement)
            // More forgiving collision detection
            prev.forEach(otherBubble => {
              if (otherBubble.id === musicBubble.id) return;
              
              const dx = newX - otherBubble.x;
              const dy = newY - otherBubble.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const minDist = bubbleRadius * 2.2; // 10% more forgiving
              
              if (dist < minDist && dist > 0) {
                // Push apart to prevent overlap (gentler correction)
                const overlap = minDist - dist;
                const separationX = (dx / dist) * overlap * 0.3; // Gentler (0.5 -> 0.3)
                const separationY = (dy / dist) * overlap * 0.3;
                newX += separationX;
                newY += separationY;
              }
            });

            // Collision detection with tag bubbles - allow close proximity but prevent overlap
            currentCanvasBubbles.forEach(tagBubble => {
              // Check if this tag bubble matches the music's tags
              const isMatchingTag = musicBubble.music.tags.some(musicTag =>
                musicTag.value === tagBubble.tag.value &&
                musicTag.type === tagBubble.tag.type
              );
              
              if (isMatchingTag) {
                // For matching tags, allow very close proximity (more forgiving)
                const tagBubbleRadius = 40;
                const minDistance = bubbleRadius + tagBubbleRadius - 15; // More forgiving (was -5)
                
                const dx = newX - tagBubble.x;
                const dy = newY - tagBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance && distance > 0) {
                  // Only push away if too close (overlapping)
                  const overlap = minDistance - distance;
                  const separationX = (dx / distance) * overlap * 0.3; // Gentler (was 1.0)
                  const separationY = (dy / distance) * overlap * 0.3;
                  
                  newX += separationX;
                  newY += separationY;
                  
                  // Gentle collision force as acceleration to maintain minimum distance (3x slower)
                  const collisionForce = 0.067; // 3x slower (0.2 / 3)
                  acc.ax += (dx / distance) * collisionForce;
                  acc.ay += (dy / distance) * collisionForce;
                }
              } else {
                // For non-matching tags, maintain normal separation (more forgiving)
                const tagBubbleRadius = 40;
                const minDistance = bubbleRadius + tagBubbleRadius + 10; // More forgiving (was 0)
                
                const dx = newX - tagBubble.x;
                const dy = newY - tagBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance && distance > 0) {
                  const overlap = minDistance - distance;
                  const separationX = (dx / distance) * overlap * 0.3; // Gentler (was 1.0)
                  const separationY = (dy / distance) * overlap * 0.3;
                  
                  newX += separationX;
                  newY += separationY;
                  
                  const collisionForce = 0.133; // 3x slower (0.4 / 3)
                  acc.ax += (dx / distance) * collisionForce;
                  acc.ay += (dy / distance) * collisionForce;
                }
              }
            });

            // Constrain to canvas bounds
            const constrainedX = Math.max(bubbleRadius, Math.min(canvasWidth - bubbleRadius, newX));
            const constrainedY = Math.max(bubbleRadius, Math.min(canvasHeight - bubbleRadius, newY));

            // Bounce back if hit boundary
            if (constrainedX !== newX) {
              vel.vx *= -0.2;
              newX = constrainedX;
            }
            if (constrainedY !== newY) {
              vel.vy *= -0.2;
              newY = constrainedY;
            }

            return {
              ...musicBubble,
              x: newX,
              y: newY,
              targetX: targetX,
              targetY: targetY
            };
          } else {
            // Very close to target (within dead zone) - stop completely to prevent shaking
            vel.vx = 0;
            vel.vy = 0;
            return {
              ...musicBubble,
              x: musicBubble.x, // Keep current position, don't snap to target
              y: musicBubble.y,
              targetX: targetX,
              targetY: targetY
            };
          }
        });
      });

      // Always continue the loop when there are music bubbles
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(physicsStep);
      }
    };

    // Start animation loop if there are music bubbles
    if (musicBubbles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(physicsStep);
    }

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [musicBubbles.length, canvasBubbles.length, DATA]);

  // Handle drag start from list
  const handleDragStart = (e, index) => {
    dragStateRef.current = { index, dropped: false, type: 'list' };
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
    e.dataTransfer.setData('drag-type', 'list');
    
    // Store original position
    const element = tagRefs.current[index];
    if (element) {
      const rect = element.getBoundingClientRect();
      tagRefs.current[index].originalPosition = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    }
  };

  // Mouse-based dragging for canvas bubbles
  const [isDraggingCanvasBubble, setIsDraggingCanvasBubble] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Mouse-based dragging for music bubbles
  const [isDraggingMusicBubble, setIsDraggingMusicBubble] = useState(false);
  const [draggedMusicBubbleId, setDraggedMusicBubbleId] = useState(null);
  const [musicBubbleDragOffset, setMusicBubbleDragOffset] = useState({ x: 0, y: 0 });

  // Handle mouse down on canvas bubble
  const handleCanvasBubbleMouseDown = (e, bubbleId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const bubble = canvasBubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    // Calculate offset from mouse to bubble center
    const offsetX = mouseX - bubble.x;
    const offsetY = mouseY - bubble.y;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedCanvasBubbleId(bubbleId);
    setIsDraggingCanvasBubble(true);
  };

  // Handle drag start from canvas (for drag and drop fallback)
  const handleCanvasBubbleDragStart = (e, bubbleId) => {
    // Prevent default drag image
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('bubble-id', bubbleId);
    e.dataTransfer.setData('drag-type', 'canvas');
  };

  // Handle drag over canvas
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOverCanvas(true);
  };

  // Handle drag leave canvas
  const handleDragLeave = (e) => {
    // Only set to false if we're actually leaving the canvas (not just moving to a child)
    if (!canvasRef.current?.contains(e.relatedTarget)) {
      setIsDraggingOverCanvas(false);
    }
  };

  // Handle drop on canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragType = e.dataTransfer.getData('drag-type');
    
    if (dragType === 'list') {
      // Dropping from list to canvas
      const index = parseInt(e.dataTransfer.getData('text/html'));
      if (isNaN(index)) return;

      dragStateRef.current.dropped = true;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      // Check if dropped inside canvas
      if (
        x >= 0 && x <= canvasRect.width &&
        y >= 0 && y <= canvasRect.height
      ) {
        // Add to canvas bubbles
        const tag = TAGGSS[index];
        const newBubble = {
          id: `canvas-${Date.now()}-${index}`,
          tagIndex: index,
          tag: tag,
          x: x,
          y: y,
          isCircle: true
        };
        
        setCanvasBubbles(prev => {
          const updated = [...prev, newBubble];
          
          // Update music bubbles based on all music in DATTAA
          setMusicBubbles(prevMusic => {
            const existingMusicIds = new Set(prevMusic.map(mb => mb.music.id));
            const newMusicBubbles = [];
            
            // Check all music in DATTAA
            DATA.forEach(music => {
              // Skip if already exists
              if (existingMusicIds.has(music.id)) return;
              
              // Check if this music should be shown (has matching tags in canvas)
              if (shouldShowMusicBubble(music)) {
                const matchingTags = findMatchingTagBubbles(music);
                if (matchingTags.length > 0) {
                  const targetPos = calculateCombinedTargetPosition(music, matchingTags);
                  if (targetPos) {
                    // Start at a random position or near first matching tag
                    const startX = matchingTags[0].x + (Math.random() - 0.5) * 200;
                    const startY = matchingTags[0].y + (Math.random() - 0.5) * 200;
                    
                    newMusicBubbles.push({
                      id: `music-${music.id}`,
                      music: music,
                      x: startX,
                      y: startY,
                      targetX: targetPos.x,
                      targetY: targetPos.y
                    });
                    
                    // Initialize velocity
                    musicBubbleVelocities.current[`music-${music.id}`] = { vx: 0, vy: 0 };
                  }
                }
              }
            });
            
            return [...prevMusic, ...newMusicBubbles];
          });
          
          return updated;
        });
      }
      setDraggedIndex(null);
    } else if (dragType === 'canvas') {
      // Moving canvas bubble within canvas
      const bubbleId = e.dataTransfer.getData('bubble-id');
      if (!bubbleId) return;

      dragStateRef.current.dropped = true;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      // Check if dropped inside canvas
      if (
        x >= 0 && x <= canvasRect.width &&
        y >= 0 && y <= canvasRect.height
      ) {
        // Update bubble position - music bubbles will update automatically via physics
        setCanvasBubbles(prev =>
          prev.map(bubble =>
            bubble.id === bubbleId ? { ...bubble, x, y } : bubble
          )
        );
      } else {
        // Dropped outside canvas - remove from canvas (will return to list)
        // Music bubbles will be updated automatically by the useEffect
        setCanvasBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
      }
      setDraggedCanvasBubbleId(null);
    }
  };

  // Return bubble to original position
  const returnToOriginal = (index) => {
    setIsReturning(index);
    setTimeout(() => {
      setIsReturning(null);
    }, 500);
  };

  // Handle drag end from list
  const handleDragEnd = (e) => {
    const index = dragStateRef.current.index;
    
    if (index === null || index === undefined) {
      setDraggedIndex(null);
      return;
    }

    // If not dropped in canvas, return to original position
    if (!dragStateRef.current.dropped) {
      returnToOriginal(index);
    }
    
    dragStateRef.current = { index: null, dropped: false, type: null };
    setDraggedIndex(null);
  };

  // Handle mouse move for dragging canvas bubbles
  useEffect(() => {
    if (!isDraggingCanvasBubble || !draggedCanvasBubbleId) return;

    const handleMouseMove = (e) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Calculate new bubble position
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;

      // Update bubble position (allow it to go outside for visual feedback)
      // Update ref immediately so physics can follow in real-time
      setCanvasBubbles(prev => {
        const updated = prev.map(bubble =>
          bubble.id === draggedCanvasBubbleId
            ? { ...bubble, x: newX, y: newY }
            : bubble
        );
        // Update ref immediately for real-time physics following
        canvasBubblesRef.current = updated;
        return updated;
      });
    };

    const handleMouseUp = (e) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (canvasRect && draggedCanvasBubbleId) {
        // Check if bubble is outside canvas bounds
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const isOutsideCanvas = 
          mouseX < canvasRect.left || 
          mouseX > canvasRect.right ||
          mouseY < canvasRect.top || 
          mouseY > canvasRect.bottom;

        if (isOutsideCanvas) {
          // Remove from canvas (will return to list)
          // Music bubbles will be updated automatically by the useEffect
          setCanvasBubbles(prev => prev.filter(bubble => bubble.id !== draggedCanvasBubbleId));
        } else {
          // Keep in canvas, but constrain to bounds
          setCanvasBubbles(prev => {
            const bubble = prev.find(b => b.id === draggedCanvasBubbleId);
            if (bubble) {
              const mouseX = e.clientX - canvasRect.left;
              const mouseY = e.clientY - canvasRect.top;
              const newX = mouseX - dragOffset.x;
              const newY = mouseY - dragOffset.y;
              
              const bubbleRadius = 40;
              const constrainedX = Math.max(bubbleRadius, Math.min(canvasRect.width - bubbleRadius, newX));
              const constrainedY = Math.max(bubbleRadius, Math.min(canvasRect.height - bubbleRadius, newY));
              
              return prev.map(b =>
                b.id === draggedCanvasBubbleId
                  ? { ...b, x: constrainedX, y: constrainedY }
                  : b
              );
            }
            return prev;
          });
        }
      }

      setIsDraggingCanvasBubble(false);
      setDraggedCanvasBubbleId(null);
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCanvasBubble, draggedCanvasBubbleId, dragOffset]);

  // Handle mouse down on music bubble
  const handleMusicBubbleMouseDown = (e, bubbleId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const bubble = musicBubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    // Calculate offset from mouse to bubble center
    const offsetX = mouseX - bubble.x;
    const offsetY = mouseY - bubble.y;
    
    setMusicBubbleDragOffset({ x: offsetX, y: offsetY });
    setDraggedMusicBubbleId(bubbleId);
    setIsDraggingMusicBubble(true);
    musicBubbleDragStateRef.current = { isDragging: true, draggedId: bubbleId };
    
    // Reset velocity when starting to drag
    if (musicBubbleVelocities.current[bubbleId]) {
      musicBubbleVelocities.current[bubbleId] = { vx: 0, vy: 0 };
    }
  };

  // Handle mouse move for dragging music bubbles
  useEffect(() => {
    if (!isDraggingMusicBubble || !draggedMusicBubbleId) return;

    const handleMouseMove = (e) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Calculate new bubble position
      const newX = mouseX - musicBubbleDragOffset.x;
      const newY = mouseY - musicBubbleDragOffset.y;

      // Constrain to canvas bounds
      const bubbleRadius = 30;
      const constrainedX = Math.max(bubbleRadius, Math.min(canvasRect.width - bubbleRadius, newX));
      const constrainedY = Math.max(bubbleRadius, Math.min(canvasRect.height - bubbleRadius, newY));

      // Update bubble position
      setMusicBubbles(prev =>
        prev.map(bubble =>
          bubble.id === draggedMusicBubbleId
            ? { ...bubble, x: constrainedX, y: constrainedY }
            : bubble
        )
      );
    };

    const handleMouseUp = () => {
      setIsDraggingMusicBubble(false);
      setDraggedMusicBubbleId(null);
      setMusicBubbleDragOffset({ x: 0, y: 0 });
      musicBubbleDragStateRef.current = { isDragging: false, draggedId: null };
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingMusicBubble, draggedMusicBubbleId, musicBubbleDragOffset, musicBubbles]);

  // Handle drag end from canvas (for drag and drop fallback)
  const handleCanvasBubbleDragEnd = (e) => {
    const bubbleId = dragStateRef.current.bubbleId;
    
    if (!bubbleId) {
      setDraggedCanvasBubbleId(null);
      return;
    }

    // Check if dropped outside canvas
    if (!dragStateRef.current.dropped) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // If dropped outside canvas, remove from canvas (returns to list)
      // Music bubbles will be updated automatically by the useEffect
      if (
        !canvasRect ||
        x < canvasRect.left || x > canvasRect.right ||
        y < canvasRect.top || y > canvasRect.bottom
      ) {
        setCanvasBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
      }
    }
    
    dragStateRef.current = { bubbleId: null, dropped: false, type: null };
    setDraggedCanvasBubbleId(null);
  };

  // Handle drop outside canvas (on document)
  useEffect(() => {
    const handleDocumentDrop = (e) => {
      const dragType = e.dataTransfer?.getData('drag-type');
      
      if (dragType === 'canvas') {
        const bubbleId = e.dataTransfer.getData('bubble-id');
        if (bubbleId) {
          // Remove from canvas if dropped outside
          // Music bubbles will be updated automatically by the useEffect
          setCanvasBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
          setDraggedCanvasBubbleId(null);
          dragStateRef.current = { bubbleId: null, dropped: false, type: null };
        }
      }
    };

    const handleDocumentDragOver = (e) => {
      const dragType = e.dataTransfer?.types;
      if (dragType && dragType.includes('drag-type')) {
        e.preventDefault();
      }
    };

    document.addEventListener('drop', handleDocumentDrop);
    document.addEventListener('dragover', handleDocumentDragOver);

    return () => {
      document.removeEventListener('drop', handleDocumentDrop);
      document.removeEventListener('dragover', handleDocumentDragOver);
    };
  }, []);

  return (
    <div className="page4">
      <div className="page4-header">
        <button 
          className="back-button"
          onClick={() => navigate('/page3')}
        >
          ← Back to Chart
        </button>
        <h1>PAGE4</h1>
      </div>
      <div className="page4-content">
        <div className="tags-panel">
          <div className="tags-header">
            <h2>Tags</h2>
            <span className="tags-count">{TAGGSS.length} tags</span>
          </div>
          <div className="tags-list">
            {TAGGSS.map((tag, index) => {
              const isInCanvas = canvasBubbles.some(b => b.tagIndex === index);
              const isDragging = draggedIndex === index;
              const isReturningToOriginal = isReturning === index;
              
              return (
                <div 
                  key={index}
                  ref={el => tagRefs.current[index] = el}
                  draggable={!isInCanvas}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`tag-bubble tag-bubble-${tag.type} ${
                    isInCanvas ? 'tag-in-canvas' : ''
                  } ${
                    isDragging ? 'tag-dragging' : ''
                  } ${
                    isReturningToOriginal ? 'tag-returning' : ''
                  }`}
                  style={{
                    opacity: isInCanvas ? 0.3 : 1,
                    cursor: isInCanvas ? 'not-allowed' : 'grab'
                  }}
                >
                  {tag.value}
                </div>
              );
            })}
          </div>
        </div>
        <div className="divider-line"></div>
        <div 
          ref={canvasRef}
          className={`canvas-area ${isDraggingOverCanvas ? 'canvas-drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            handleCanvasDrop(e);
            setIsDraggingOverCanvas(false);
          }}
        >
          <div className="canvas-label">CANVAS</div>
          {canvasBubbles.map((bubble) => {
            const isDragging = draggedCanvasBubbleId === bubble.id || isDraggingCanvasBubble && draggedCanvasBubbleId === bubble.id;
            return (
              <div
                key={bubble.id}
                ref={el => canvasBubbleRefs.current[bubble.id] = el}
                draggable={true}
                onMouseDown={(e) => handleCanvasBubbleMouseDown(e, bubble.id)}
                onDragStart={(e) => handleCanvasBubbleDragStart(e, bubble.id)}
                onDragEnd={handleCanvasBubbleDragEnd}
                className={`canvas-bubble canvas-bubble-${bubble.tag.type} canvas-bubble-circle ${
                  isDragging ? 'canvas-bubble-dragging' : ''
                }`}
                style={{
                  position: 'absolute',
                  left: `${bubble.x}px`,
                  top: `${bubble.y}px`,
                  transform: 'translate(-50%, -50%)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  opacity: isDragging ? 0.7 : 1,
                  zIndex: isDragging ? 100 : 10
                }}
              >
                {bubble.tag.value}
              </div>
            );
          })}
          {musicBubbles.map((musicBubble) => {
            const isDragging = isDraggingMusicBubble && draggedMusicBubbleId === musicBubble.id;
            return (
              <div
                key={musicBubble.id}
                className="music-bubble-container"
                onMouseDown={(e) => handleMusicBubbleMouseDown(e, musicBubble.id)}
                style={{
                  position: 'absolute',
                  left: `${musicBubble.x}px`,
                  top: `${musicBubble.y}px`,
                  transform: 'translate(-50%, -50%)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  zIndex: isDragging ? 20 : 5
                }}
              >
                <div className={`music-bubble ${isDragging ? 'music-bubble-dragging' : ''}`}>
                  <img 
                    src={musicBubble.music.image} 
                    alt={musicBubble.music.name}
                    className="music-bubble-image"
                  />
                  <div className="music-bubble-name-overlay">{musicBubble.music.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Page4;

