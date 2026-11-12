/* Kettlebell Workouts — exercise database v2
 * Each exercise has `poses`: an array of side-view keyframes (facing right) in a
 * 220x180 viewBox, ground at y=164. The workout screen morphs between them to
 * animate the movement. Frames contain head/spine/arms/legs/kb only; arrows and
 * boxes live on the exercise itself so they stay put while the figure moves.
 * Limbs are [joint,joint,joint] point triples. `unilateral: true` = single-arm/leg
 * move, the engine deals it as an L then R pair back-to-back.
 */

const EXERCISES = [
  // ---------------- FULL BODY ----------------
  {
    id: 'swing', name: 'Kettlebell Swing', groups: ['full', 'lower'], level: 2,
    cue: 'Hinge at the hips and brace your core — snap your glutes to float the bell up to chest height.',
    arrows: [{ from: [86, 154], ctrl: [68, 120], to: [86, 98] }],
    poses: [
      // A: deep hinge, bell between legs (bottom of swing)
      { head: [142, 85], spine: [[132, 90], [92, 104]],
        armsF: [[130, 92, 117, 116, 107, 140]], armsB: [[127, 92, 114, 116, 104, 140]],
        legsF: [[92, 104, 104, 136, 110, 164]], legsB: [[92, 104, 78, 134, 68, 164]],
        kb: [105, 150] },
      // B: top of swing, chest height
      { head: [107, 52], spine: [[105, 63], [101, 106]],
        armsF: [[105, 67, 106, 84, 105, 99]], armsB: [[102, 67, 101, 84, 100, 99]],
        legsF: [[101, 106, 108, 136, 105, 164]], legsB: [[101, 106, 97, 136, 92, 164]],
        kb: [102, 108] }
    ]
  },
  {
    id: 'snatch', name: 'Snatch', groups: ['full'], level: 3, unilateral: true,
    cue: 'One motion: swing down, pull through, lock out under the bell. Keep that elbow fast!',
    arrows: [{ from: [96, 152], ctrl: [64, 86], to: [118, 20] }],
    poses: [
      // A: hinge bottom, bell between legs
      { head: [144, 87], spine: [[134, 92], [94, 105]],
        armsF: [[132, 94, 119, 118, 108, 142]], armsB: [[129, 94, 116, 118, 105, 142]],
        legsF: [[94, 105, 106, 137, 112, 164]], legsB: [[94, 105, 80, 135, 70, 164]],
        kb: [106, 151] },
      // B: overhead lockout
      { head: [108, 54], spine: [[106, 65], [102, 106]],
        armsF: [[107, 69, 112, 40, 114, 24]], armsB: [[102, 69, 95, 86, 104, 90]],
        legsF: [[102, 106, 110, 134, 107, 164]], legsB: [[102, 106, 95, 136, 89, 164]],
        kb: [115, 16] }
    ]
  },
  {
    id: 'tgu', name: 'Turkish Get-Up', groups: ['core', 'full'], level: 3, unilateral: true,
    cue: 'One arm up, eyes on the bell — move slow and control every position.',
    arrows: [{ from: [92, 152], ctrl: [60, 84], to: [116, 22] }],
    poses: [
      // A: lying back, arm locked up (simplified)
      { head: [40, 152], spine: [[50, 154], [96, 156]],
        armsF: [[54, 153, 58, 116, 60, 78]], armsB: [[94, 155, 102, 158, 108, 161]],
        legsF: [[96, 156, 118, 132, 118, 164]], legsB: [[96, 156, 112, 138, 110, 164]],
        kb: [61, 66] },
      // B: standing tall, arm locked up
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 110, 40, 112, 24]], armsB: [[101, 67, 98, 92, 99, 116]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [113, 16] }
    ]
  },
  {
    id: 'sumo-row', name: 'Sumo Deadlift High Row', groups: ['full', 'lower'], level: 2,
    cue: 'Wide stance, flat back — pull the bell up to your hip and squeeze your shoulder blade.',
    arrows: [{ from: [154, 152], ctrl: [160, 134], to: [152, 122] }],
    poses: [
      // A: hinge with bell down between feet
      { head: [146, 86], spine: [[136, 92], [88, 104]],
        armsF: [[134, 95, 138, 120, 139, 146]], armsB: [[131, 95, 135, 120, 136, 146]],
        legsF: [[88, 104, 106, 136, 112, 164]], legsB: [[88, 104, 72, 134, 62, 164]],
        kb: [140, 151] },
      // B: pulled to hip
      { head: [146, 86], spine: [[136, 92], [88, 104]],
        armsF: [[134, 95, 142, 90, 137, 104]], armsB: [[131, 95, 139, 90, 134, 104]],
        legsF: [[88, 104, 106, 136, 112, 164]], legsB: [[88, 104, 72, 134, 62, 164]],
        kb: [138, 118] }
    ]
  },
  {
    id: 'clean-press', name: 'Clean & Press', groups: ['full', 'upper'], level: 2, unilateral: true,
    cue: 'Catch in the rack with your elbow high, then press straight overhead.',
    arrows: [{ from: [114, 76], ctrl: [134, 44], to: [118, 24] }],
    poses: [
      // A: catch in the rack
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 114, 90, 109, 72]], armsB: [[101, 67, 94, 84, 103, 88]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [105, 82] },
      // B: pressed overhead
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 110, 42, 111, 30]], armsB: [[101, 67, 94, 84, 103, 88]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [112, 18] }
    ]
  },
  {
    id: 'thruster', name: 'Squat to Press', groups: ['full', 'lower', 'upper'], level: 2,
    cue: 'Drive out of the bottom of the squat and press as you stand — one smooth push.',
    arrows: [{ from: [124, 116], ctrl: [142, 70], to: [126, 30] }],
    poses: [
      // A: deep squat, bell racked at chest
      { head: [106, 74], spine: [[104, 85], [100, 132]],
        armsF: [[105, 89, 114, 104, 109, 90]], armsB: [[101, 89, 94, 104, 102, 108]],
        legsF: [[100, 132, 124, 142, 120, 164]], legsB: [[100, 132, 90, 146, 82, 164]],
        kb: [105, 102] },
      // B: standing tall, locked overhead
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 110, 42, 111, 30]], armsB: [[101, 67, 94, 84, 103, 88]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [112, 18] }
    ]
  },
  {
    id: 'overhead-carry', name: 'Overhead Carry', groups: ['upper', 'full'], level: 1,
    cue: 'Lock out, ribs down, walk tall. Pack your shoulders and don’t let the bell drift.',
    arrows: [{ from: [56, 154], ctrl: [112, 148], to: [168, 154] }],
    poses: [
      // A: stride position 1
      { head: [106, 52], spine: [[104, 63], [101, 108]],
        armsF: [[105, 67, 108, 42, 109, 30]], armsB: [[99, 67, 95, 90, 94, 112]],
        legsF: [[101, 108, 112, 136, 118, 164]], legsB: [[101, 108, 92, 138, 84, 164]],
        kb: [110, 18] },
      // B: stride position 2 (other leg forward)
      { head: [106, 52], spine: [[104, 63], [101, 108]],
        armsF: [[105, 67, 108, 42, 109, 30]], armsB: [[99, 67, 95, 90, 94, 112]],
        legsF: [[101, 108, 92, 137, 85, 164]], legsB: [[101, 108, 112, 136, 118, 164]],
        kb: [110, 18] }
    ]
  },
  {
    id: 'deadlift', name: 'Kettlebell Deadlift', groups: ['lower', 'full'], level: 1,
    cue: 'Push your hips back over the bell, then drive up tall. Keep that path straight.',
    arrows: [{ from: [148, 152], ctrl: [156, 120], to: [150, 96] }],
    poses: [
      // A: hinged at the hips, bell on the floor
      { head: [137, 78], spine: [[128, 84], [94, 106]],
        armsF: [[126, 87, 130, 115, 131, 143]], armsB: [[123, 87, 127, 115, 128, 143]],
        legsF: [[94, 106, 108, 136, 114, 164]], legsB: [[94, 106, 78, 134, 70, 164]],
        kb: [130, 151] },
      // B: standing tall at lockout
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[105, 67, 106, 90, 106, 112]], armsB: [[102, 67, 103, 90, 103, 112]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [104, 125] }
    ]
  },

  // ---------------- LOWER BODY ----------------
  {
    id: 'goblet-squat', name: 'Goblet Squat', groups: ['lower'], level: 1,
    cue: 'Elbows inside your knees, sit between your heels, drive up through mid-foot.',
    poses: [
      // A: standing with bell at chest
      { head: [105, 54], spine: [[104, 63], [102, 108]],
        armsF: [[105, 67, 115, 88, 111, 98]], armsB: [[102, 67, 110, 90, 107, 100]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [111, 90] },
      // B: bottom of the squat
      { head: [106, 70], spine: [[104, 81], [100, 132]],
        armsF: [[104, 86, 116, 104, 112, 114]], armsB: [[101, 86, 110, 106, 107, 116]],
        legsF: [[100, 132, 124, 142, 120, 164]], legsB: [[100, 132, 90, 146, 82, 164]],
        kb: [112, 105] }
    ]
  },
  {
    id: 'split-squat', name: 'Split Squat', groups: ['lower'], level: 2,
    cue: 'Both knees at 90°, torso tall. Drive hard through the front heel.',
    poses: [
      // A: standing, feet staggered
      { head: [104, 56], spine: [[103, 67], [102, 108]],
        armsF: [[104, 72, 115, 90, 111, 100]], armsB: [[101, 72, 109, 92, 106, 102]],
        legsF: [[102, 108, 112, 136, 117, 164]], legsB: [[102, 108, 93, 137, 85, 164]],
        kb: [111, 91] },
      // B: back knee down
      { head: [104, 58], spine: [[102, 69], [98, 112]],
        armsF: [[102, 74, 114, 92, 110, 102]], armsB: [[99, 74, 108, 94, 105, 104]],
        legsF: [[98, 112, 124, 134, 122, 164]], legsB: [[98, 112, 78, 150, 66, 164]],
        kb: [110, 93] }
    ]
  },
  {
    id: 'lunge', name: 'Walking Lunge', groups: ['lower'], level: 1,
    cue: 'Step forward and sink until both knees hit 90°. Keep that chest proud.',
    poses: [
      // A: standing tall
      { head: [105, 54], spine: [[104, 63], [102, 108]],
        armsF: [[105, 67, 115, 88, 111, 98]], armsB: [[102, 67, 110, 90, 107, 100]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [111, 90] },
      // B: mid-lunge
      { head: [106, 58], spine: [[104, 69], [100, 118]],
        armsF: [[104, 74, 116, 92, 112, 102]], armsB: [[101, 74, 110, 94, 107, 104]],
        legsF: [[100, 118, 128, 140, 126, 164]], legsB: [[100, 118, 74, 144, 58, 164]],
        kb: [112, 93] }
    ]
  },
  {
    id: 'step-up', name: 'Step-Up', groups: ['lower'], level: 1,
    cue: 'Drive through the top foot — don’t push off the floor with your back leg.',
    box: { x: 128, y: 138, w: 56, h: 26 },
    poses: [
      // A: standing beside the step
      { head: [102, 54], spine: [[100, 67], [96, 108]],
        armsF: [[100, 72, 112, 90, 108, 100]], armsB: [[97, 72, 106, 92, 103, 102]],
        legsF: [[96, 108, 104, 137, 108, 164]], legsB: [[96, 108, 88, 138, 82, 164]],
        kb: [108, 91] },
      // B: foot on the step, driving up
      { head: [102, 56], spine: [[100, 67], [96, 110]],
        armsF: [[100, 72, 112, 90, 108, 100]], armsB: [[97, 72, 106, 92, 103, 102]],
        legsF: [[96, 110, 124, 122, 142, 138]], legsB: [[96, 110, 78, 142, 66, 164]],
        kb: [108, 91] }
    ]
  },
  {
    id: 'lateral-lunge', name: 'Lateral Lunge', groups: ['lower'], level: 2,
    cue: 'Slide into the side with your knee over your ankle and sit low. Push hips back to center.',
    poses: [
      // A: feet together
      { head: [104, 56], spine: [[103, 67], [102, 108]],
        armsF: [[104, 72, 115, 90, 111, 100]], armsB: [[101, 72, 109, 92, 106, 102]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [111, 91] },
      // B: slid out wide, sitting low
      { head: [104, 58], spine: [[102, 69], [99, 126]],
        armsF: [[102, 74, 114, 92, 110, 102]], armsB: [[99, 74, 108, 94, 105, 104]],
        legsF: [[99, 126, 120, 144, 118, 164]], legsB: [[99, 126, 74, 150, 56, 164]],
        kb: [110, 93] }
    ]
  },

  // ---------------- UPPER BODY ----------------
  {
    id: 'press', name: 'Overhead Press', groups: ['upper'], level: 2, unilateral: true,
    cue: 'Elbow in line with your shoulder, no rib flare. Lock it out right over your ear.',
    arrows: [{ from: [116, 78], ctrl: [130, 48], to: [118, 26] }],
    poses: [
      // A: bell racked at the shoulder
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 113, 88, 110, 74]], armsB: [[101, 67, 94, 84, 103, 88]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [105, 84] },
      // B: locked out overhead
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 110, 42, 111, 30]], armsB: [[101, 67, 94, 84, 103, 88]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [112, 18] }
    ]
  },
  {
    id: 'floor-press', name: 'Floor Press', groups: ['upper'], level: 1,
    cue: 'Shoulder blades down and back — press straight up until your elbows lock.',
    arrows: [{ from: [76, 150], ctrl: [84, 112], to: [78, 84] }],
    poses: [
      // A: bell at the chest, elbows down
      { head: [36, 152], spine: [[47, 154], [92, 156]],
        armsF: [[52, 153, 60, 134, 64, 122]], armsB: [[50, 154, 56, 136, 60, 126]],
        legsF: [[92, 156, 114, 120, 114, 164]], legsB: [[92, 156, 108, 126, 106, 164]],
        kb: [63, 112] },
      // B: pressed to lockout
      { head: [36, 152], spine: [[47, 154], [92, 156]],
        armsF: [[52, 153, 58, 120, 60, 94]], armsB: [[50, 154, 54, 124, 58, 98]],
        legsF: [[92, 156, 114, 120, 114, 164]], legsB: [[92, 156, 108, 126, 106, 164]],
        kb: [60, 82] }
    ]
  },
  {
    id: 'pushup-kb', name: 'Push-Up on KBs', groups: ['upper'], level: 2,
    cue: 'Body in a straight line — let the extra range of motion work your shoulders and chest.',
    poses: [
      // A: top position, arms straight
      { head: [152, 108], spine: [[138, 116], [92, 138]],
        armsF: [[136, 118, 140, 132, 141, 147]], armsB: [[132, 120, 126, 140, 123, 157]],
        legsF: [[92, 138, 70, 150, 50, 162]], legsB: [[92, 138, 64, 154, 44, 163]],
        kb: [142, 151] },
      // B: bottom position, elbows at 90°
      { head: [152, 108], spine: [[138, 116], [92, 138]],
        armsF: [[136, 118, 140, 140, 141, 147]], armsB: [[132, 120, 126, 144, 122, 158]],
        legsF: [[92, 138, 70, 150, 50, 162]], legsB: [[92, 138, 64, 154, 44, 163]],
        kb: [142, 151] }
    ]
  },
  {
    id: 'plank-press', name: 'Plank Press', groups: ['upper', 'core'], level: 2, unilateral: true,
    cue: 'Hips stay level with your shoulder — no dropping. Press to a full lockout.',
    arrows: [{ from: [130, 152], ctrl: [146, 118], to: [156, 76] }],
    poses: [
      // A: plank with bell down at the floor beside your shoulder
      { head: [150, 110], spine: [[136, 118], [90, 140]],
        armsF: [[134, 120, 137, 140, 139, 156]], armsB: [[130, 122, 126, 144, 124, 158]],
        legsF: [[90, 140, 68, 152, 48, 162]], legsB: [[90, 140, 62, 156, 42, 163]],
        kb: [140, 151] },
      // B: pressed overhead from the plank
      { head: [150, 110], spine: [[136, 118], [90, 140]],
        armsF: [[134, 120, 146, 96, 152, 72]], armsB: [[130, 122, 126, 144, 124, 158]],
        legsF: [[90, 140, 68, 152, 48, 162]], legsB: [[90, 140, 62, 156, 42, 163]],
        kb: [154, 60] }
    ]
  },
  {
    id: 'bent-row', name: 'Bent-Over Row', groups: ['upper'], level: 1, unilateral: true,
    cue: 'Flat back in a hinge position. Pull the bell to your hip and control it down.',
    arrows: [{ from: [156, 150], ctrl: [162, 130], to: [154, 112] }],
    poses: [
      // A: hinged over the bell on the floor
      { head: [148, 88], spine: [[138, 94], [92, 104]],
        armsF: [[136, 95, 140, 118, 141, 142]], armsB: [[133, 95, 137, 118, 138, 142]],
        legsF: [[92, 104, 106, 136, 112, 164]], legsB: [[92, 104, 76, 134, 66, 164]],
        kb: [141, 151] },
      // B: pulled to the hip
      { head: [148, 88], spine: [[138, 94], [92, 104]],
        armsF: [[136, 95, 146, 88, 140, 102]], armsB: [[133, 95, 143, 88, 137, 102]],
        legsF: [[92, 104, 106, 136, 112, 164]], legsB: [[92, 104, 76, 134, 66, 164]],
        kb: [141, 116] }
    ]
  },
  {
    id: 'halo', name: 'Halo', groups: ['upper'], level: 1,
    cue: 'Slow and controlled — smooth circles around your head, both directions.',
    arrows: [{ d: 'M 137 58 A 33 33 0 1 1 135 45', headAngle: -55 }],
    poses: [
      // A: bell at the side of the head
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 116, 58, 121, 50]], armsB: [[101, 67, 109, 56, 116, 52]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [124, 46] },
      // B: bell on top of the head
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 110, 48, 110, 38]], armsB: [[101, 67, 105, 50, 108, 38]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [110, 32] },
      // C: bell behind the head
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[102, 67, 98, 56, 95, 50]], armsB: [[105, 67, 101, 58, 97, 52]],
        legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
        kb: [94, 46] }
    ]
  },

  // ---------------- CORE ----------------
  {
    id: 'suitcase-carry', name: 'Suitcase Carry', groups: ['core'], level: 1, unilateral: true,
    cue: 'Walk tall right next to the load — resist leaning into it.',
    arrows: [{ from: [56, 154], ctrl: [112, 148], to: [168, 154] }],
    poses: [
      // A: stride position 1
      { head: [108, 54], spine: [[106, 65], [102, 110]],
        armsF: [[107, 69, 112, 94, 113, 118]], armsB: [[100, 69, 95, 92, 93, 114]],
        legsF: [[102, 110, 113, 137, 119, 164]], legsB: [[102, 110, 93, 138, 85, 164]],
        kb: [113, 132] },
      // B: stride position 2
      { head: [108, 54], spine: [[106, 65], [102, 110]],
        armsF: [[107, 69, 112, 94, 113, 118]], armsB: [[100, 69, 95, 92, 93, 114]],
        legsF: [[102, 110, 93, 137, 86, 164]], legsB: [[102, 110, 113, 137, 119, 164]],
        kb: [113, 132] }
    ]
  },
  {
    id: 'windmill', name: 'Windmill', groups: ['core'], level: 2, unilateral: true,
    cue: 'Deep lunge with one arm long over your body. Don’t let your hips rotate.',
    arrows: [{ from: [154, 92], ctrl: [152, 40], to: [118, 36] }],
    poses: [
      // A: deep lunge, reaching arm down by the front foot
      { head: [134, 92], spine: [[128, 98], [98, 130]],
        armsF: [[126, 100, 138, 128, 145, 156]], armsB: [[124, 102, 140, 132, 147, 158]],
        legsF: [[98, 130, 126, 144, 134, 164]], legsB: [[98, 130, 80, 150, 74, 164]],
        kb: null },
      // B: arm long over the body
      { head: [134, 92], spine: [[128, 98], [98, 130]],
        armsF: [[126, 100, 138, 72, 136, 44]], armsB: [[124, 102, 140, 132, 147, 158]],
        legsF: [[98, 130, 126, 144, 134, 164]], legsB: [[98, 130, 80, 150, 74, 164]],
        kb: null }
    ]
  },
  {
    id: 'rack-carry', name: 'Front Rack Carry', groups: ['core'], level: 1,
    cue: 'Elbow high and core braced — walk without letting the bell swing on you.',
    arrows: [{ from: [56, 154], ctrl: [112, 148], to: [168, 154] }],
    poses: [
      // A: stride position 1
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 114, 90, 109, 72]], armsB: [[100, 67, 95, 92, 93, 114]],
        legsF: [[102, 108, 113, 136, 119, 164]], legsB: [[102, 108, 93, 138, 85, 164]],
        kb: [105, 82] },
      // B: stride position 2
      { head: [105, 52], spine: [[104, 63], [102, 108]],
        armsF: [[106, 67, 114, 90, 109, 72]], armsB: [[100, 67, 95, 92, 93, 114]],
        legsF: [[102, 108, 93, 137, 86, 164]], legsB: [[102, 108, 113, 136, 119, 164]],
        kb: [105, 82] }
    ]
  },
  {
    id: 'russian-twist', name: 'Russian Twist', groups: ['core'], level: 2,
    cue: 'Hinge back about 45° and keep your chest tall. Rotate with your ribs, not your arms.',
    arrows: [{ d: 'M 130 138 A 27 11 0 1 1 95 140', headAngle: 25 }],
    poses: [
      // A: bell out in front
      { head: [68, 94], spine: [[76, 104], [92, 150]],
        armsF: [[78, 108, 94, 122, 106, 128]], armsB: [[75, 108, 90, 124, 103, 130]],
        legsF: [[92, 150, 122, 134, 132, 162]], legsB: [[92, 150, 116, 140, 126, 162]],
        kb: [114, 128] },
      // B: bell rotated back beside the hips
      { head: [68, 94], spine: [[76, 104], [92, 150]],
        armsF: [[78, 108, 86, 128, 75, 136]], armsB: [[75, 108, 83, 130, 72, 138]],
        legsF: [[92, 150, 122, 134, 132, 162]], legsB: [[92, 150, 116, 140, 126, 162]],
        kb: [67, 134] }
    ]
  },
  {
    id: 'plank-pass', name: 'Plank Bell Pass', groups: ['core', 'upper'], level: 2, unilateral: true,
    cue: 'Hold a steady plank and pass the bell under your body in one smooth arc.',
    arrows: [{ from: [148, 74], ctrl: [90, 192], to: [30, 120] }],
    poses: [
      // A: bell up behind the shoulder
      { head: [150, 110], spine: [[136, 118], [90, 140]],
        armsF: [[132, 120, 128, 144, 126, 158]], armsB: [[138, 117, 142, 96, 140, 80]],
        legsF: [[90, 140, 68, 152, 48, 162]], legsB: [[90, 140, 62, 156, 42, 163]],
        kb: [141, 68] },
      // B: bell passed down and forward under the body
      { head: [150, 110], spine: [[136, 118], [90, 140]],
        armsF: [[132, 120, 128, 144, 126, 158]], armsB: [[138, 117, 148, 134, 152, 148]],
        legsF: [[90, 140, 68, 152, 48, 162]], legsB: [[90, 140, 62, 156, 42, 163]],
        kb: [155, 148] }
    ]
  }
];

const GROUPS = [
  { id: 'full', label: 'Full Body' },
  { id: 'upper', label: 'Upper Body' },
  { id: 'lower', label: 'Lower Body' },
  { id: 'core', label: 'Core' }
];

const LEVELS = [
  { id: 0, label: 'All levels' },
  { id: 1, label: 'Beginner' },
  { id: 2, label: 'Intermediate' },
  { id: 3, label: 'Advanced' }
];
