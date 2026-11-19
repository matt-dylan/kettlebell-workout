/* Kettlebell Workouts — exercise database v4 (side + front views)
 * Each exercise has `poses` (side view, facing right) AND `posesFront` (front
 * view, figure faces the viewer). Both use a 220x180 viewBox with ground at
 * y=164 and must have the SAME number of keyframes so the two angles animate
 * in sync. The workout screen shows both angles side by side; more keyframes
 * give smoother loops (swing bottom/mid/top, halo front/over/back…).
 *
 * Frame fields: head [x,y] · spine [[neck],[hip]] · armsF/armsB & legsF/legsB =
 * one limb each as flat joint coordinates [x1,y1,x2,y2,x3,y3] (shoulder-elbow-
 * wrist / hip-knee-foot) · kb [x,y] bell center. Frames contain the figure only;
 * arrows and boxes live on the exercise itself so they stay put while it moves
 * (side-view `arrows`/`box`; front view uses optional `boxFront`).
 * `unilateral: true` = single-arm/leg move, the engine deals it as an L then R
 * pair back-to-back.
 */

// ---- front-view building blocks (figure faces viewer, center x=110) ----
const F_STAND = { head:[110,58], spine:[[110,70],[110,104]], armsF:[97,73,94,95,92,117], armsB:[123,73,126,95,128,117], legsF:[104,104,102,134,100,164], legsB:[116,104,118,134,120,164] };
function fp(over) { // front-view frame: standing base + per-pose overrides
  return Object.assign({ head:F_STAND.head.slice(), spine:[[F_STAND.spine[0][0],F_STAND.spine[0][1]],[F_STAND.spine[1][0],F_STAND.spine[1][1]]], armsF:F_STAND.armsF.slice(), armsB:F_STAND.armsB.slice(), legsF:F_STAND.legsF.slice(), legsB:F_STAND.legsB.slice() }, over);
}
const F_OVERHEAD_L = { armsF:[98,72,100,48,101,26], kb:[101,14] }; // working arm locked up
const F_HINGE_LEGS = { legsF:[104,110,101,138,99,164], legsB:[116,110,119,138,121,164] }; // slight knee bend
const F_DEEP_SQUAT = { head:[110,84], spine:[[110,96],[109,130]], legsF:[103,130,92,144,84,164], legsB:[117,130,128,144,136,164] };
const F_GOBLET = { armsF:[97,75,103,92,107,100], armsB:[123,75,117,92,113,100], kb:[110,100] };
const F_STRIDE_L = { legsF:[104,106,94,136,88,164], legsB:[116,106,126,136,132,164] }; // left foot out
const F_STRIDE_R = { legsF:[116,106,126,136,132,164], legsB:[104,106,94,136,88,164] }; // right foot out
const F_SEATED = { head:[110,94], spine:[[110,106],[112,140]], legsF:[105,140,96,152,97,164], legsB:[119,140,128,152,127,164] };
const F_PLANK = { head:[110,116], spine:[[110,128],[113,148]], armsB:[121,130,123,146,125,158], legsF:[106,148,104,156,102,163], legsB:[118,148,120,156,122,163] }; // foreshortened plank

const EXERCISES = [
  // ---------------- FULL BODY ----------------
  {
    id: 'swing', name: 'Kettlebell Swing', groups: ['full', 'lower'], level: 2,
    cue: 'Hinge at the hips and brace your core — snap your glutes to float the bell up to chest height.',
    arrows: [{ from: [78, 150], ctrl: [62, 118], to: [80, 92] }],
    poses: [
      // A: bottom of hinge — pelvis back, torso ~50°, bell between the legs (off the floor)
      { head: [121, 86], spine: [[112, 94], [80, 114]],
        armsF: [110, 96, 108, 120, 105, 142], armsB: [107, 96, 105, 120, 103, 142],
        legsF: [80, 114, 96, 138, 100, 164], legsB: [80, 114, 74, 138, 66, 164],
        kb: [94, 148] },
      // B: mid-pull — bell passing in front of the thighs as the torso rises
      { head: [106, 66], spine: [[102, 78], [86, 108]],
        armsF: [100, 80, 108, 102, 114, 122], armsB: [97, 80, 105, 102, 111, 122],
        legsF: [86, 108, 94, 136, 98, 164], legsB: [86, 108, 84, 136, 80, 164],
        kb: [118, 132] },
      // C: top of swing — glutes driving, arms extended forward, bell floating at chin/chest height in front of the face
      { head: [99, 60], spine: [[97, 72], [90, 106]],
        armsF: [96, 74, 113, 70, 130, 68], armsB: [93, 74, 110, 72, 127, 70],
        legsF: [90, 106, 96, 134, 100, 164], legsB: [90, 106, 88, 134, 84, 164],
        kb: [131, 84] }
    ],
    posesFront: [
      fp({ head:[110,64], spine:[[110,76],[110,110]], ...F_HINGE_LEGS, armsF:[98,78,104,105,108,132], armsB:[122,78,116,105,112,132], kb:[110,146] }), // hands low between the legs
      fp({ head:[110,60], spine:[[110,72],[110,106]], armsF:[98,75,103,100,107,124], armsB:[122,75,117,100,113,124], kb:[110,134] }), // bell at thigh level
      fp({ armsF:[98,75,104,86,108,94], armsB:[122,75,116,86,112,94], kb:[110,110] }) // arms driving toward you at chest height (foreshortened)
    ]
  },
  {
    id: 'snatch', name: 'Snatch', groups: ['full'], level: 3, unilateral: true,
    cue: 'One motion: swing down, pull through with a fast elbow, lock out under the bell.',
    arrows: [{ from: [96, 152], ctrl: [64, 86], to: [118, 20] }],
    poses: [
      // A: hinge bottom — bell between the legs, free arm relaxed at the side (full length)
      { head: [121, 86], spine: [[112, 94], [80, 114]],
        armsF: [110, 96, 108, 120, 105, 142], armsB: [107, 96, 99, 114, 97, 132],
        legsF: [80, 114, 96, 138, 100, 164], legsB: [80, 114, 74, 138, 66, 164],
        kb: [95, 148] },
      // B: mid-pull — standing, elbow driving low and back, forearm vertical in front of the thigh
      { head: [100, 62], spine: [[98, 74], [88, 108]],
        armsF: [97, 76, 92, 104, 104, 120], armsB: [95, 78, 91, 100, 93, 122],
        legsF: [88, 108, 94, 136, 98, 164], legsB: [88, 108, 86, 136, 82, 164],
        kb: [106, 130] },
      // C: overhead lockout — arm straight up under the bell, ribs stacked over the wrist; free arm relaxed at the side
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [97, 74, 99, 50, 101, 28], armsB: [94, 76, 87, 95, 91, 113],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [102, 16] }
    ],
    posesFront: [
      fp({ head:[110,64], spine:[[110,76],[110,110]], ...F_HINGE_LEGS, armsF:[98,78,104,105,108,132], armsB:[122,76,118,95,116,113], kb:[110,146] }), // working arm down between the legs, free arm at side
      fp({ head:[110,62], spine:[[110,74],[110,108]], armsF:[98,75,88,94,94,110], kb:[96,122] }), // elbow driving out and down
      fp({ ...F_OVERHEAD_L }) // locked overhead
    ]
  },
  {
    id: 'tgu', name: 'Turkish Get-Up', groups: ['core', 'full'], level: 3, unilateral: true,
    cue: 'One arm locked up the whole time — eyes on the bell as you roll, brace and stand.',
    arrows: [{ from: [92, 152], ctrl: [60, 84], to: [116, 22] }],
    poses: [
      // A: lying on the back — arm vertical with the bell locked overhead (full arm length)
      { head: [40, 152], spine: [[52, 154], [94, 156]],
        armsF: [56, 153, 57, 128, 59, 104], armsB: [60, 157, 76, 159, 92, 158],
        legsF: [94, 156, 112, 132, 112, 164], legsB: [94, 156, 106, 140, 108, 164],
        kb: [60, 90] },
      // B: half up — bridge position, supporting knee bent under the hip, arm still vertical over the shoulder
      { head: [105, 100], spine: [[97, 108], [82, 134]],
        armsF: [95, 110, 96, 85, 98, 60], armsB: [93, 112, 87, 132, 81, 150],
        legsF: [82, 134, 106, 146, 107, 164], legsB: [82, 134, 70, 152, 58, 164],
        kb: [99, 46] },
      // C: standing tall — arm still locked overhead
      { head: [99, 60], spine: [[97, 72], [90, 106]],
        armsF: [96, 74, 98, 50, 100, 28], armsB: [93, 76, 90, 98, 94, 118],
        legsF: [90, 106, 96, 134, 100, 164], legsB: [90, 106, 88, 134, 84, 164],
        kb: [101, 16] }
    ],
    posesFront: [
      fp({ head:[110,98], spine:[[110,110],[108,134]], legsF:[102,134,88,152,84,164], legsB:[116,134,130,152,134,164], armsF:[106,112,107,87,109,63], armsB:[114,112,120,132,126,150], kb:[110,49] }), // rolled low — arm still up
      fp({ head:[110,80], spine:[[110,92],[108,126]], legsF:[103,126,96,150,94,164], legsB:[117,126,124,150,126,164], armsF:[106,94,107,69,109,45], armsB:[114,94,122,114,128,136], kb:[110,31] }), // bracing up from the knees
      fp({ ...F_OVERHEAD_L }) // standing tall, arm locked
    ]
  },
  {
    id: 'sumo-row', name: 'Sumo Deadlift High Row', groups: ['full', 'lower'], level: 2,
    cue: 'Wide stance, flat back — lift to the hip, then row the bell up under your ribs.',
    arrows: [{ from: [76, 150], ctrl: [60, 118], to: [84, 94] }],
    poses: [
      // A: sumo hinge — wide stance, flat horizontal back, bell between the legs
      { head: [132, 98], spine: [[122, 104], [90, 116]],
        armsF: [120, 106, 116, 128, 112, 148], armsB: [117, 106, 113, 128, 109, 148],
        legsF: [90, 116, 112, 140, 122, 164], legsB: [90, 116, 70, 140, 58, 164],
        kb: [96, 150] },
      // B: deadlift top — standing tall, bell in front of the thighs
      { head: [102, 60], spine: [[100, 72], [94, 106]],
        armsF: [99, 74, 104, 98, 106, 122], armsB: [96, 74, 101, 98, 103, 122],
        legsF: [94, 106, 106, 136, 116, 164], legsB: [94, 106, 84, 136, 72, 164],
        kb: [108, 132] },
      // C: row — hinge back to ~55°, elbows high and pulled under the ribs
      { head: [125, 92], spine: [[116, 98], [88, 112]],
        armsF: [114, 100, 102, 106, 108, 116], armsB: [111, 100, 99, 106, 105, 116],
        legsF: [88, 112, 110, 140, 120, 164], legsB: [88, 112, 68, 140, 56, 164],
        kb: [109, 118] }
    ],
    posesFront: [
      fp({ head:[110,66], spine:[[110,78],[110,112]], legsF:[102,112,92,140,84,164], legsB:[118,112,128,140,136,164], armsF:[98,80,105,106,109,134], armsB:[122,80,115,106,111,134], kb:[110,148] }), // wide stance, hands between the legs
      fp({ armsF:[98,76,104,100,108,124], armsB:[122,76,116,100,112,124], kb:[110,136] }), // standing tall over the bell
      fp({ head:[110,66], spine:[[110,78],[110,112]], legsF:[102,112,92,140,84,164], legsB:[118,112,128,140,136,164], armsF:[97,78,88,94,102,100], armsB:[123,78,132,94,118,100], kb:[110,102] }) // elbows flared under the ribs
    ]
  },
  {
    id: 'clean-press', name: 'Clean & Press', groups: ['full', 'upper'], level: 2, unilateral: true,
    cue: 'Swing it into the rack on your shoulder, then press straight overhead — one smooth line.',
    arrows: [{ from: [96, 150], ctrl: [70, 90], to: [110, 30] }],
    poses: [
      // A: hinge bottom — bell between the legs, free arm relaxed at the side (full length)
      { head: [121, 86], spine: [[112, 94], [80, 114]],
        armsF: [110, 96, 108, 120, 105, 142], armsB: [107, 96, 99, 114, 97, 132],
        legsF: [80, 114, 96, 138, 100, 164], legsB: [80, 114, 74, 138, 66, 164],
        kb: [95, 148] },
      // B: clean — bell racked on the front of the shoulder, elbow forward and down
      { head: [100, 60], spine: [[98, 72], [90, 106]],
        armsF: [97, 74, 92, 94, 104, 82], armsB: [94, 74, 91, 96, 93, 118],
        legsF: [90, 106, 96, 134, 100, 164], legsB: [90, 106, 88, 134, 84, 164],
        kb: [106, 88] },
      // C: press lockout — arm straight overhead
      { head: [99, 58], spine: [[97, 70], [92, 106]],
        armsF: [96, 72, 98, 48, 100, 26], armsB: [93, 74, 90, 96, 92, 118],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [101, 14] }
    ],
    posesFront: [
      fp({ head:[110,64], spine:[[110,76],[110,110]], ...F_HINGE_LEGS, armsF:[98,78,104,105,108,132], armsB:[122,78,116,105,112,132], kb:[110,146] }), // swing position
      fp({ armsF:[98,74,92,94,104,86], armsB:[122,74,119,96,115,118], kb:[106,88] }), // racked on the shoulder
      fp({ ...F_OVERHEAD_L }) // pressed overhead
    ]
  },
  {
    id: 'thruster', name: 'Squat to Press', groups: ['full', 'lower', 'upper'], level: 2,
    cue: 'Drop into the squat with the bell racked — drive up and let that press finish with your legs.',
    arrows: [{ from: [84, 140], ctrl: [70, 90], to: [102, 36] }],
    poses: [
      // A: standing, bell racked on the shoulder
      { head: [100, 60], spine: [[98, 72], [90, 106]],
        armsF: [97, 74, 92, 94, 104, 82], armsB: [94, 74, 91, 96, 93, 118],
        legsF: [90, 106, 96, 134, 100, 164], legsB: [90, 106, 88, 134, 84, 164],
        kb: [106, 88] },
      // B: bottom of the squat — hips under your knees, back tall, bell still racked
      { head: [99, 84], spine: [[96, 96], [84, 128]],
        armsF: [95, 98, 90, 116, 102, 104], armsB: [92, 98, 87, 116, 98, 104],
        legsF: [84, 128, 104, 148, 106, 164], legsB: [84, 128, 96, 150, 94, 164],
        kb: [105, 110] },
      // C: standing + overhead — the drive finishes the press
      { head: [99, 58], spine: [[97, 70], [92, 104]],
        armsF: [96, 72, 98, 48, 100, 26], armsB: [93, 74, 90, 96, 92, 118],
        legsF: [92, 104, 98, 132, 102, 164], legsB: [92, 104, 88, 132, 84, 164],
        kb: [101, 14] }
    ],
    posesFront: [
      fp({ armsF:[98,74,92,94,104,86], armsB:[122,74,119,96,115,118], kb:[106,88] }), // racked, standing
      fp({ ...F_DEEP_SQUAT, armsF:[98,98,92,116,104,108], armsB:[122,98,128,116,116,108], kb:[106,110] }), // bottom of the squat, still racked
      fp({ ...F_OVERHEAD_L }) // drive finishes the press
    ]
  },

  // ---------------- UPPER BODY ----------------
  {
    id: 'overhead-carry', name: 'Overhead Carry', groups: ['upper', 'full'], level: 1, unilateral: true,
    cue: 'Lock the arm straight up and walk tall — keep the bell stacked over your shoulder.',
    arrows: [{ d: 'M 50 172 L 160 172', headAngle: 0 }],
    poses: [
      // A: standing, arm locked out overhead
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [97, 74, 99, 50, 101, 28], armsB: [93, 74, 91, 96, 93, 118],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 88, 134, 84, 164],
        kb: [102, 16] },
      // B: mid-stride — front knee bent over the ankle, back leg extending behind
      { head: [100, 62], spine: [[98, 74], [90, 108]],
        armsF: [97, 76, 99, 52, 101, 30], armsB: [93, 76, 91, 98, 93, 120],
        legsF: [90, 108, 106, 134, 112, 164], legsB: [90, 108, 78, 136, 64, 164],
        kb: [102, 18] },
      // C: opposite stride — walking in place
      { head: [100, 62], spine: [[98, 74], [90, 108]],
        armsF: [97, 76, 99, 52, 101, 30], armsB: [93, 76, 91, 98, 93, 120],
        legsF: [90, 108, 78, 136, 66, 164], legsB: [90, 108, 106, 134, 112, 164],
        kb: [102, 18] }
    ],
    posesFront: [
      fp({ ...F_OVERHEAD_L }), // standing, arm locked
      fp({ armsF:[98,73,100,49,101,27], kb:[101,15], ...F_STRIDE_L }), // stride — left foot out
      fp({ armsF:[98,73,100,49,101,27], kb:[101,15], ...F_STRIDE_R }) // opposite stride
    ]
  },
  {
    id: 'press', name: 'Overhead Press', groups: ['upper'], level: 2, unilateral: true,
    cue: 'Brace your core and ribs over the wrist — press in a straight line to lockout.',
    arrows: [{ from: [104, 96], ctrl: [122, 62], to: [108, 24] }],
    poses: [
      // A: rack position — bell on the front of the shoulder, elbow at 90° forward
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [97, 74, 92, 94, 104, 82], armsB: [94, 74, 91, 96, 93, 118],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [106, 88] },
      // B: mid-press — arm ~60° up, core braced against the lean
      { head: [100, 60], spine: [[98, 72], [91, 106]],
        armsF: [97, 74, 104, 58, 108, 42], armsB: [94, 74, 91, 96, 93, 118],
        legsF: [91, 106, 97, 134, 101, 164], legsB: [91, 106, 89, 134, 85, 164],
        kb: [111, 32] },
      // C: lockout — arm straight up, slight ribcage-over-wrist tilt
      { head: [99, 58], spine: [[97, 70], [93, 106]],
        armsF: [96, 72, 98, 48, 100, 26], armsB: [93, 74, 90, 96, 92, 118],
        legsF: [93, 106, 99, 134, 103, 164], legsB: [93, 106, 91, 134, 87, 164],
        kb: [101, 14] }
    ],
    posesFront: [
      fp({ armsF:[98,74,92,94,104,86], armsB:[122,74,119,96,115,118], kb:[106,88] }), // racked on the shoulder
      fp({ armsF:[97,72,95,54,97,36], kb:[98,26] }), // pressing straight up along the side of the head
      fp({ ...F_OVERHEAD_L }) // lockout
    ]
  },
  {
    id: 'floor-press', name: 'Floor Press', groups: ['upper'], level: 1,
    cue: 'Lie back with feet flat — press the bell to lockout from your shoulder, then lower under control.',
    arrows: [{ from: [134, 130], ctrl: [126, 108], to: [112, 104] }],
    poses: [
      // A: lying, bell racked at the shoulder (elbow pointing up)
      { head: [182, 152], spine: [[170, 154], [128, 156]],
        armsF: [168, 153, 164, 131, 142, 131], armsB: [170, 155, 166, 134, 146, 134],
        legsF: [128, 156, 108, 140, 108, 164], legsB: [128, 156, 114, 144, 112, 164],
        kb: [134, 133] },
      // B: mid-press — arm ~45° up from the floor position
      { head: [182, 152], spine: [[170, 154], [128, 156]],
        armsF: [168, 153, 160, 127, 142, 119], armsB: [170, 155, 162, 130, 146, 122],
        legsF: [128, 156, 108, 140, 108, 164], legsB: [128, 156, 114, 144, 112, 164],
        kb: [134, 117] },
      // C: lockout — arm straight up over the chest line
      { head: [182, 152], spine: [[170, 154], [128, 156]],
        armsF: [168, 153, 166, 131, 164, 109], armsB: [170, 155, 168, 133, 166, 111],
        legsF: [128, 156, 108, 140, 108, 164], legsB: [128, 156, 114, 144, 112, 164],
        kb: [163, 97] }
    ],
    posesFront: [
      fp({ head:[106,96], spine:[[110,108],[112,140]], legsF:[105,140,96,152,97,164], legsB:[119,140,128,152,127,164], armsF:[103,110,97,128,107,124], armsB:[119,112,128,130,136,136], kb:[111,126] }), // leaning back — bell at the chest
      fp({ head:[106,96], spine:[[110,108],[112,140]], legsF:[105,140,96,152,97,164], legsB:[119,140,128,152,127,164], armsF:[103,110,99,90,103,72], armsB:[119,112,128,130,136,136], kb:[105,60] }), // mid-press
      fp({ head:[106,96], spine:[[110,108],[112,140]], legsF:[105,140,96,152,97,164], legsB:[119,140,128,152,127,164], armsF:[103,110,102,88,104,66], armsB:[119,112,128,130,136,136], kb:[105,52] }) // lockout overhead
    ]
  },
  {
    id: 'pushup-kb', name: 'Push-Up on KBs', groups: ['upper'], level: 2,
    cue: 'Hands on the bells in a straight plank — go deep for extra range of motion and push back up.',
    arrows: [{ from: [164, 138], ctrl: [160, 158], to: [146, 142] }],
    poses: [
      // A: top — rigid board, arms straight on the bells (head/hands toward +x)
      { head: [186, 132], spine: [[180, 138], [124, 152]],
        armsF: [178, 139, 160, 145, 144, 149], armsB: [181, 139, 164, 144, 148, 148],
        legsF: [124, 152, 100, 158, 74, 164], legsB: [124, 152, 102, 156, 78, 163],
        kb: [142, 151] },
      // B: bottom — elbows bent and tucked, upper chest near the bell tops, hips in line
      { head: [186, 142], spine: [[180, 148], [124, 158]],
        armsF: [178, 149, 170, 161, 144, 152], armsB: [181, 149, 173, 160, 148, 151],
        legsF: [124, 158, 100, 160, 74, 164], legsB: [124, 158, 102, 159, 78, 163],
        kb: [142, 151] }
    ],
    posesFront: [
      fp({ ...F_PLANK, armsF:[99,130,97,146,95,158], kb:[95,151] }), // top — board on the bells
      fp({ head:[110,124], spine:[[110,134],[113,152]], armsB:[121,136,123,150,125,159], legsF:[106,152,104,158,102,163], legsB:[118,152,120,158,122,163], armsF:[99,136,86,148,93,157], kb:[95,151] }) // bottom — elbows flared
    ]
  },
  {
    id: 'plank-press', name: 'Plank Press', groups: ['upper', 'core'], level: 2, unilateral: true,
    cue: 'Forearm plank — press the bell to lockout overhead without letting your hips sag or pike.',
    arrows: [{ from: [170, 138], ctrl: [160, 104], to: [142, 92] }],
    poses: [
      // A: working arm extended — bell locked overhead in the plank line
      { head: [186, 130], spine: [[180, 136], [122, 150]],
        armsF: [176, 137, 174, 113, 172, 89], armsB: [178, 137, 178, 158, 162, 160],
        legsF: [122, 150, 98, 157, 72, 164], legsB: [122, 150, 100, 155, 76, 163],
        kb: [171, 77] },
      // B: arm down — bell at floor level beside the hip, support elbow under the shoulder
      { head: [186, 130], spine: [[180, 136], [122, 150]],
        armsF: [176, 137, 168, 152, 150, 156], armsB: [178, 137, 178, 158, 162, 160],
        legsF: [122, 150, 98, 157, 72, 164], legsB: [122, 150, 100, 155, 76, 163],
        kb: [142, 151] }
    ],
    posesFront: [
      fp({ ...F_PLANK, armsF:[99,130,100,106,101,82], kb:[103,70] }), // pressed overhead in the plank line
      fp({ ...F_PLANK, armsF:[99,130,97,148,105,154], kb:[111,151] }) // arm down beside the hip
    ]
  },
  {
    id: 'bent-row', name: 'Bent-Over Row', groups: ['upper'], level: 1, unilateral: true,
    cue: 'Hinge to ~45° with a flat back — row the bell up under your ribs and squeeze the shoulder blade.',
    arrows: [{ from: [108, 132], ctrl: [96, 122], to: [100, 112] }],
    poses: [
      // A: hinge — torso ~45°, arm hanging with the bell
      { head: [117, 89], spine: [[108, 96], [82, 112]],
        armsF: [106, 98, 104, 122, 103, 140], armsB: [103, 98, 100, 122, 98, 142],
        legsF: [82, 112, 94, 138, 98, 164], legsB: [82, 112, 78, 138, 72, 164],
        kb: [102, 148] },
      // B: row — same hinge, elbow high and back, bell at the ribs
      { head: [117, 89], spine: [[108, 96], [82, 112]],
        armsF: [106, 98, 92, 104, 100, 114], armsB: [103, 98, 100, 122, 98, 142],
        legsF: [82, 112, 94, 138, 98, 164], legsB: [82, 112, 78, 138, 72, 164],
        kb: [103, 118] }
    ],
    posesFront: [
      fp({ head:[110,64], spine:[[110,76],[110,110]], armsF:[97,78,95,102,94,126], kb:[93,140] }), // hinged forward — arm hanging
      fp({ head:[110,64], spine:[[110,76],[110,110]], armsF:[97,78,87,94,101,100], kb:[103,102] }) // elbow flared back under the ribs
    ]
  },
  {
    id: 'halo', name: 'Halo', groups: ['upper'], level: 1,
    cue: 'Hold the bell at arm’s length and circle it around your head — front, over, back. Keep it close.',
    arrows: [{ d: 'M 128 96 Q 130 40 100 30 Q 70 40 68 104', headAngle: -90 }],
    poses: [
      // A: bell in front of the chest — arms extended forward at arm's length (hands on either side of the handle)
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [97, 76, 115, 80, 134, 84], armsB: [94, 76, 112, 82, 131, 86],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [140, 92] },
      // B: bell over the top of the head — arms up and around
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [97, 76, 106, 50, 103, 32], armsB: [95, 76, 103, 52, 101, 34],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [101, 24] },
      // C: bell behind the lower back — arms down and around
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [97, 76, 82, 92, 64, 108], armsB: [95, 76, 80, 94, 62, 111],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [56, 115] }
    ],
    posesFront: [
      fp({ armsF:[97,75,92,83,103,89], armsB:[123,75,128,83,117,89], kb:[110,87] }), // bell in front of the chest
      fp({ armsF:[97,73,100,50,104,34], armsB:[123,73,120,52,116,36], kb:[110,24] }), // over the top
      fp({ armsF:[97,76,89,94,94,110], armsB:[123,76,131,94,126,110], kb:[110,112] }) // behind the lower back
    ]
  },

  // ---------------- LOWER BODY ----------------
  {
    id: 'deadlift', name: 'Kettlebell Deadlift', groups: ['lower', 'full'], level: 1,
    cue: 'Flat back, hips back — drive through the heels and stand tall over the bell.',
    arrows: [{ from: [78, 150], ctrl: [64, 120], to: [86, 96] }],
    poses: [
      // A: hinge setup — flat back ~horizontal, bell between the legs
      { head: [121, 86], spine: [[112, 94], [80, 114]],
        armsF: [110, 96, 106, 120, 104, 142], armsB: [107, 96, 103, 120, 101, 142],
        legsF: [80, 114, 94, 138, 98, 164], legsB: [80, 114, 76, 138, 70, 164],
        kb: [92, 150] },
      // B: halfway up — torso at ~45°, bell clearing the shins
      { head: [113, 73], spine: [[106, 82], [84, 110]],
        armsF: [104, 84, 102, 108, 100, 128], armsB: [101, 84, 99, 108, 97, 128],
        legsF: [84, 110, 96, 137, 100, 164], legsB: [84, 110, 80, 137, 74, 164],
        kb: [104, 136] },
      // C: lockout — standing tall, bell in front of the thighs
      { head: [101, 60], spine: [[99, 72], [92, 106]],
        armsF: [98, 74, 101, 98, 103, 120], armsB: [95, 74, 98, 98, 100, 120],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [106, 130] }
    ],
    posesFront: [
      fp({ head:[110,66], spine:[[110,78],[110,112]], legsF:[104,112,101,139,99,164], legsB:[116,112,119,139,121,164], armsF:[98,80,105,108,109,136], armsB:[122,80,115,108,111,136], kb:[110,150] }), // hinged — bell between the legs
      fp({ head:[110,60], spine:[[110,72],[110,107]], armsF:[98,76,104,102,108,128], armsB:[122,76,116,102,112,128], kb:[110,138] }), // halfway up
      fp({ armsF:[98,75,104,99,108,122], armsB:[122,75,116,99,112,122], kb:[110,132] }) // locked out over the bell
    ]
  },
  {
    id: 'goblet-squat', name: 'Goblet Squat', groups: ['lower'], level: 1,
    cue: 'Hold the bell at your chest — sit down between your knees and keep those elbows inside them.',
    arrows: [{ from: [100, 116], ctrl: [76, 128], to: [80, 152] }],
    poses: [
      // A: standing goblet — bell cradled at the chest
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [99, 76, 104, 92, 105, 102], armsB: [96, 76, 101, 92, 102, 102],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [108, 100] },
      // B: mid-squat — hips dropping back and down, back tall
      { head: [97, 80], spine: [[94, 92], [84, 122]],
        armsF: [93, 94, 100, 110, 101, 120], armsB: [90, 94, 97, 110, 98, 120],
        legsF: [84, 122, 104, 146, 108, 164], legsB: [84, 122, 94, 150, 92, 164],
        kb: [104, 116] },
      // C: bottom — hips near knee height, heels on the floor, elbows between the knees
      { head: [95, 90], spine: [[92, 102], [80, 132]],
        armsF: [91, 104, 98, 120, 99, 130], armsB: [88, 104, 95, 120, 96, 130],
        legsF: [80, 132, 105, 141, 109, 164], legsB: [80, 132, 91, 145, 88, 164],
        kb: [102, 126] }
    ],
    posesFront: [
      fp({ ...F_GOBLET }), // standing goblet
      fp({ head:[110,78], spine:[[110,90],[109,124]], legsF:[103,124,92,150,88,164], legsB:[117,124,128,150,132,164], armsF:[98,92,104,108,108,116], armsB:[122,92,116,108,112,116], kb:[110,116] }), // mid-squat — knees tracking out
      fp({ ...F_DEEP_SQUAT, armsF:[98,100,104,116,108,124], armsB:[122,100,116,116,112,124], kb:[110,124] }) // bottom
    ]
  },
  {
    id: 'split-squat', name: 'Split Squat', groups: ['lower'], level: 2,
    cue: 'Long stance — sink the back knee toward the floor and drive up through the front heel.',
    arrows: [{ from: [98, 114], ctrl: [72, 130], to: [80, 152] }],
    poses: [
      // A: standing, bell at the chest
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [99, 76, 104, 92, 105, 102], armsB: [96, 76, 101, 92, 102, 102],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [108, 100] },
      // B: split position — front knee ~90° over the ankle, back leg bent with full-length bones
      { head: [97, 78], spine: [[94, 90], [84, 120]],
        armsF: [93, 92, 100, 108, 101, 118], armsB: [90, 92, 97, 108, 98, 118],
        legsF: [84, 120, 106, 138, 110, 164], legsB: [84, 120, 70, 142, 64, 164],
        kb: [104, 114] },
      // C: bottom of the split — back knee dropping toward the floor
      { head: [95, 84], spine: [[92, 96], [80, 126]],
        armsF: [91, 98, 98, 114, 99, 124], armsB: [88, 98, 95, 114, 96, 124],
        legsF: [80, 126, 104, 142, 108, 164], legsB: [80, 126, 66, 144, 60, 164],
        kb: [102, 120] }
    ],
    posesFront: [
      fp({ ...F_GOBLET }), // standing goblet
      fp({ head:[110,78], spine:[[110,90],[109,122]], legsF:[103,122,96,148,92,164], legsB:[117,122,128,150,136,164], armsF:[98,92,104,108,108,116], armsB:[122,92,116,108,112,116], kb:[110,114] }), // split stance — front knee over the ankle
      fp({ head:[110,84], spine:[[110,96],[109,128]], legsF:[103,128,95,150,91,164], legsB:[117,128,130,153,138,164], armsF:[98,98,104,114,108,122], armsB:[122,98,116,114,112,122], kb:[110,120] }) // back knee dropping
    ]
  },
  {
    id: 'lunge', name: 'Walking Lunge', groups: ['lower'], level: 1,
    cue: 'Step forward and drop the back knee — both knees track over your toes as you walk.',
    arrows: [{ d: 'M 50 172 L 160 172', headAngle: 0 }],
    poses: [
      // A: standing, bell at the side of the hip
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [98, 74, 100, 98, 102, 122], armsB: [95, 74, 91, 96, 93, 118],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [103, 134] },
      // B: mid-lunge — front knee bent over the ankle, back leg driving behind
      { head: [100, 64], spine: [[98, 76], [90, 110]],
        armsF: [97, 78, 104, 100, 108, 120], armsB: [95, 78, 86, 100, 80, 120],
        legsF: [90, 110, 108, 134, 114, 164], legsB: [90, 110, 74, 138, 58, 164],
        kb: [110, 132] },
      // C: opposite stride — walking in place
      { head: [100, 64], spine: [[98, 76], [90, 110]],
        armsF: [95, 78, 86, 100, 80, 120], armsB: [97, 78, 104, 100, 108, 120],
        legsF: [90, 110, 74, 138, 58, 164], legsB: [90, 110, 108, 134, 114, 164],
        kb: [78, 132] }
    ],
    posesFront: [
      fp({ armsF:[98,74,100,98,102,122], kb:[103,134] }), // standing — bell at the side of the hip
      fp({ head:[110,62], spine:[[110,74],[109,110]], armsF:[98,76,100,100,102,122], kb:[103,134], ...F_STRIDE_L }), // stride — left leg through
      fp({ head:[110,62], spine:[[110,74],[109,110]], armsF:[98,76,100,100,102,122], kb:[103,134], ...F_STRIDE_R }) // opposite stride
    ]
  },
  {
    id: 'step-up', name: 'Step-Up', groups: ['lower'], level: 1,
    cue: 'Drive through the front heel to stand on the box — step back down under control.',
    box: { x: 126, y: 126, w: 72, h: 38 },
    boxFront: { x: 65, y: 126, w: 90, h: 38 },
    arrows: [{ from: [96, 150], ctrl: [116, 140], to: [138, 128] }],
    poses: [
      // A: standing beside the box, bell at the chest
      { head: [84, 62], spine: [[82, 74], [76, 108]],
        armsF: [81, 76, 88, 92, 89, 102], armsB: [78, 76, 85, 92, 86, 102],
        legsF: [76, 108, 82, 136, 86, 164], legsB: [76, 108, 72, 136, 68, 164],
        kb: [92, 100] },
      // B: stepping up — front foot on the box, back leg pushing off behind
      { head: [94, 66], spine: [[92, 78], [84, 112]],
        armsF: [91, 80, 98, 96, 99, 106], armsB: [88, 80, 95, 96, 96, 106],
        legsF: [84, 112, 112, 128, 140, 126], legsB: [84, 112, 70, 140, 56, 164],
        kb: [102, 104] },
      // C: standing on the box — tall and balanced, both feet on top
      { head: [149, 23], spine: [[146, 35], [140, 68]],
        armsF: [146, 37, 152, 52, 153, 62], armsB: [143, 37, 149, 52, 150, 62],
        legsF: [140, 68, 146, 96, 150, 126], legsB: [140, 68, 136, 96, 132, 126],
        kb: [156, 60] }
    ],
    posesFront: [
      fp({ armsF:[98,74,100,98,102,122], kb:[103,134] }), // standing in front of the box
      fp({ head:[110,62], spine:[[110,74],[109,110]], armsF:[98,76,100,100,102,122], kb:[103,134], legsF:[109,110,107,136,105,158], legsB:[117,110,122,138,126,164] }), // driving the front leg up
      fp({ head:[110,20], spine:[[110,32],[110,66]], armsF:[98,36,100,60,102,84], armsB:[122,36,120,60,118,84], kb:[103,96], legsF:[104,66,102,96,100,126], legsB:[116,66,118,96,120,126] }) // standing on top
    ]
  },
  {
    id: 'lateral-lunge', name: 'Lateral Lunge', groups: ['lower'], level: 2,
    cue: 'Squat out to the side — sit your hips back over one bent leg while the other stays long.',
    arrows: [{ from: [96, 118], ctrl: [70, 134], to: [78, 154] }],
    poses: [
      // A: standing, bell at the chest
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [99, 76, 104, 92, 105, 102], armsB: [96, 76, 101, 92, 102, 102],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [108, 100] },
      // B: lateral lunge — hips back and low over the bent leg, other leg long
      { head: [99, 82], spine: [[96, 94], [84, 124]],
        armsF: [95, 96, 102, 112, 103, 122], armsB: [92, 96, 99, 112, 100, 122],
        legsF: [84, 124, 104, 146, 108, 164], legsB: [84, 124, 76, 146, 64, 164],
        kb: [106, 118] },
      // C: deeper — hips back and low, bent leg with full-length bones
      { head: [97, 88], spine: [[94, 100], [80, 130]],
        armsF: [93, 102, 100, 118, 101, 128], armsB: [90, 102, 97, 118, 98, 128],
        legsF: [80, 130, 105, 141, 109, 164], legsB: [80, 130, 72, 150, 58, 164],
        kb: [104, 124] }
    ],
    posesFront: [
      fp({ ...F_GOBLET }), // standing goblet
      fp({ head:[110,84], spine:[[110,96],[109,128]], legsF:[103,128,84,146,74,164], legsB:[117,128,132,150,140,164], armsF:[98,98,104,114,108,122], armsB:[122,98,116,114,112,122], kb:[110,120] }), // knee out wide — hips back over it
      fp({ head:[110,88], spine:[[110,100],[109,132]], legsF:[103,132,78,148,66,164], legsB:[117,132,136,152,144,164], armsF:[98,102,104,118,108,126], armsB:[122,102,116,118,112,126], kb:[110,124] }) // deeper
    ]
  },

  // ---------------- CORE ----------------
  {
    id: 'suitcase-carry', name: 'Suitcase Carry', groups: ['core'], level: 1, unilateral: true,
    cue: 'Bell at your side — walk tall and keep that shoulder level. Your obliques are doing the work.',
    arrows: [{ d: 'M 50 172 L 160 172', headAngle: 0 }],
    poses: [
      // A: standing, bell hanging at the side of the hip
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [98, 74, 100, 98, 102, 122], armsB: [95, 74, 91, 96, 93, 118],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [103, 134] },
      // B: mid-stride — opposite arm swinging with the front leg
      { head: [100, 62], spine: [[98, 74], [90, 108]],
        armsF: [97, 76, 100, 100, 103, 122], armsB: [95, 76, 86, 98, 80, 118],
        legsF: [90, 108, 106, 134, 112, 164], legsB: [90, 108, 78, 136, 64, 164],
        kb: [104, 134] },
      // C: opposite stride — walking in place
      { head: [100, 62], spine: [[98, 74], [90, 108]],
        armsF: [95, 76, 86, 100, 80, 120], armsB: [97, 76, 104, 100, 108, 120],
        legsF: [90, 108, 78, 136, 66, 164], legsB: [90, 108, 106, 134, 112, 164],
        kb: [78, 134] }
    ],
    posesFront: [
      fp({ armsF:[98,74,100,98,102,122], kb:[103,136] }), // standing — bell at the side of one hip
      fp({ head:[110,62], spine:[[110,74],[109,108]], armsF:[98,76,100,100,102,122], kb:[103,136], ...F_STRIDE_L }), // walking — shoulders stay level
      fp({ head:[110,62], spine:[[110,74],[109,108]], armsF:[98,76,100,100,102,122], kb:[103,136], ...F_STRIDE_R }) // opposite stride
    ]
  },
  {
    id: 'windmill', name: 'Windmill', groups: ['core'], level: 2, unilateral: true,
    cue: 'Arm locked overhead the whole time — hinge down and around to the side, eyes on the bell.',
    arrows: [{ from: [92, 96], ctrl: [64, 118], to: [76, 142] }],
    poses: [
      // A: top position — standing with a slight lunge, arm vertical overhead
      { head: [98, 62], spine: [[96, 74], [88, 108]],
        armsF: [95, 76, 97, 52, 99, 30], armsB: [92, 78, 89, 98, 93, 118],
        legsF: [88, 108, 100, 136, 106, 164], legsB: [88, 108, 76, 136, 68, 164],
        kb: [100, 18] },
      // B: bottom — deep lunge, torso hinged ~90° to the side, arm still vertical (the bell stays put)
      { head: [120, 120], spine: [[108, 124], [72, 128]],
        armsF: [106, 125, 108, 95, 110, 65], armsB: [103, 127, 92, 144, 84, 160],
        legsF: [72, 128, 88, 146, 98, 164], legsB: [72, 128, 56, 146, 40, 164],
        kb: [111, 53] }
    ],
    posesFront: [
      fp({ head:[108,62], spine:[[109,74],[107,108]], armsF:[97,75,99,50,101,28], kb:[102,16], legsF:[103,108,94,136,88,164], legsB:[115,108,124,136,130,164] }), // top — lunge with arm locked up
      fp({ head:[110,100], spine:[[110,112],[108,136]], legsF:[102,136,88,152,84,164], legsB:[116,136,130,152,134,164], armsF:[105,114,106,89,107,64], armsB:[114,114,120,134,126,152], kb:[108,50] }) // hinged down deep — arm still up
    ]
  },
  {
    id: 'rack-carry', name: 'Front Rack Carry', groups: ['core'], level: 1,
    cue: 'Bell racked on the shoulder — walk with a tall spine and let your abs keep you from leaning back.',
    arrows: [{ d: 'M 50 172 L 160 172', headAngle: 0 }],
    poses: [
      // A: standing, bell racked on the front of the shoulder
      { head: [100, 60], spine: [[98, 72], [92, 106]],
        armsF: [97, 74, 92, 94, 104, 82], armsB: [94, 74, 91, 96, 93, 118],
        legsF: [92, 106, 98, 134, 102, 164], legsB: [92, 106, 90, 134, 86, 164],
        kb: [106, 88] },
      // B: mid-stride — bell stays racked as you walk
      { head: [100, 62], spine: [[98, 74], [90, 108]],
        armsF: [96, 76, 91, 96, 103, 84], armsB: [93, 76, 90, 98, 92, 120],
        legsF: [90, 108, 106, 134, 112, 164], legsB: [90, 108, 78, 136, 64, 164],
        kb: [107, 90] },
      // C: opposite stride — walking in place
      { head: [100, 62], spine: [[98, 74], [90, 108]],
        armsF: [96, 76, 91, 96, 103, 84], armsB: [93, 76, 90, 98, 92, 120],
        legsF: [90, 108, 78, 136, 66, 164], legsB: [90, 108, 106, 134, 112, 164],
        kb: [107, 90] }
    ],
    posesFront: [
      fp({ armsF:[98,74,92,94,104,86], armsB:[122,74,119,96,115,118], kb:[106,88] }), // racked — walking tall
      fp({ head:[110,62], spine:[[110,74],[109,108]], armsF:[97,76,91,98,103,88], kb:[106,90], ...F_STRIDE_L }), // stride — bell stays racked
      fp({ head:[110,62], spine:[[110,74],[109,108]], armsF:[97,76,91,98,103,88], kb:[106,90], ...F_STRIDE_R }) // opposite stride
    ]
  },
  {
    id: 'russian-twist', name: 'Russian Twist', groups: ['core'], level: 2,
    cue: 'Sit tall with heels down — rotate from the ribs and swing the bell side to side. Don’t round your back.',
    arrows: [{ d: 'M 118 128 Q 96 148 58 138', headAngle: -170 }],
    poses: [
      // A: seated, torso leaning back — bell extended in front of the chest
      { head: [71, 109], spine: [[78, 118], [96, 148]],
        armsF: [78, 120, 94, 124, 110, 126], armsB: [75, 122, 90, 126, 106, 129],
        legsF: [96, 148, 116, 150, 124, 164], legsB: [96, 148, 112, 152, 120, 164],
        kb: [118, 128] },
      // B: center — bell over the lap
      { head: [71, 109], spine: [[78, 118], [96, 148]],
        armsF: [78, 120, 88, 130, 98, 134], armsB: [75, 122, 85, 132, 94, 136],
        legsF: [96, 148, 116, 150, 124, 164], legsB: [96, 148, 112, 152, 120, 164],
        kb: [105, 136] },
      // C: rotated — bell swung behind the hip
      { head: [71, 109], spine: [[78, 118], [96, 148]],
        armsF: [78, 120, 64, 130, 52, 136], armsB: [75, 122, 61, 132, 49, 138],
        legsF: [96, 148, 116, 150, 124, 164], legsB: [96, 148, 112, 152, 120, 164],
        kb: [44, 138] }
    ],
    posesFront: [
      fp({ ...F_SEATED, armsF:[103,110,92,122,84,128], armsB:[117,110,104,126,92,132], kb:[78,132] }), // rotated to one side
      fp({ ...F_SEATED, armsF:[103,112,104,124,105,136], armsB:[117,112,116,124,115,136], kb:[110,140] }), // center — bell over the lap
      fp({ ...F_SEATED, armsF:[103,110,116,122,124,128], armsB:[117,110,130,126,142,132], kb:[142,132] }) // rotated the other way
    ]
  },
  {
    id: 'plank-pass', name: 'Plank Bell Pass', groups: ['core', 'upper'], level: 2,
    cue: 'Forearm plank — press the bell to lockout, then pass it hand-to-hand across your body.',
    arrows: [{ d: 'M 160 148 Q 176 92 134 150', headAngle: 125 }],
    poses: [
      // A: working arm extended — bell locked overhead in the plank line
      { head: [186, 130], spine: [[180, 136], [122, 150]],
        armsF: [176, 137, 174, 113, 172, 89], armsB: [178, 137, 178, 158, 162, 160],
        legsF: [122, 150, 98, 157, 72, 164], legsB: [122, 150, 100, 155, 76, 163],
        kb: [171, 77] },
      // B: hands together under the chest — bell at center, both elbows down
      { head: [186, 130], spine: [[180, 136], [122, 150]],
        armsF: [176, 137, 168, 152, 158, 154], armsB: [178, 137, 178, 158, 162, 160],
        legsF: [122, 150, 98, 157, 72, 164], legsB: [122, 150, 100, 155, 76, 163],
        kb: [158, 151] },
      // C: pass complete — hand back behind the hips (toward the feet) with the bell on the floor
      { head: [186, 130], spine: [[180, 136], [122, 150]],
        armsF: [176, 137, 154, 138, 133, 140], armsB: [180, 137, 180, 158, 164, 160],
        legsF: [122, 150, 98, 157, 72, 164], legsB: [122, 150, 100, 155, 76, 163],
        kb: [132, 154] }
    ],
    posesFront: [
      fp({ ...F_PLANK, armsF:[99,130,100,106,101,82], kb:[103,70] }), // pressed overhead in the plank line
      fp({ ...F_PLANK, armsF:[99,130,103,148,108,154], armsB:[121,130,117,148,112,154], kb:[110,151] }), // hands together under the chest
      fp({ ...F_PLANK, armsF:[99,130,110,148,124,152], kb:[130,152] }) // passed back behind the hips
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
