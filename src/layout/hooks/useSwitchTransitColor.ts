import { Ref } from "vue";

export function useSwitchTransitColor(bgColor: Ref) {
  const gradualTransitionColor = (fromColor, toColor, divRef, direction) => {
    const fps = 1000 / 60;
    // const complexTransitionTime = 3000; // <-- for complex animation
    const transitionTime = 1000; // <-- 100 ms - time our animation will last 动画持续10秒
    // let previousTime, start = 0; // <-- stores data on animation 动画数据
    const angle = 180; // <-- angle of gradient 倾斜角度
    let animationDirection = "forwards"; // <-- stores the animation direction 存储动画方向
    // const complexAnDirection = "forwards"; // <-- for continuous animation 连续动画
    // const element = "gradient-button-transition"; // <-- id of our button 按钮ID
    let intervalFrame; // <-- stores the interval frame 存储间隔帧
    // let complexIntervalFrame; // <-- for 'always on' gradient transition
    let currentPct = 0; // <-- current percentage through the animation
    // const complexCurrentPct = 0; // <-- current pct for complex animation
    let elapsed = 0; // <-- number of frames which have ellapsed
    // const complexElapsed = 0; // <-- complex elapsed time

    // GRADIENT COLORS
    const gradientStopOne = [
      {
        pct: 0,
        color: { r: fromColor[0][0], g: fromColor[0][1], b: fromColor[0][2] }
      }, // #ff7147 The first color in your gradient
      {
        pct: 100,
        color: { r: fromColor[1][0], g: fromColor[1][1], b: fromColor[1][2] }
      } // #0037ff The color you want your first color to transition to
    ];
    const gradientStopTwo = [
      {
        pct: 0,
        color: { r: toColor[0][0], g: toColor[0][1], b: toColor[0][2] }
      }, // #ff7147 The first color in your gradient
      {
        pct: 100,
        color: { r: toColor[1][0], g: toColor[1][1], b: toColor[1][2] }
      } // #00adff The color you want your second color to transition to
    ];
    // Apply our gradient programmatically so we can completely manipulate the gradient from JS rather than CSS
    const c1 = gradientStopOne[0].color;
    const c2 = gradientStopTwo[0].color;

    divRef.style.background = `linear-gradient(${angle}deg, rgb(${c1.r}, ${c1.g}, ${c1.b}), rgb(${c2.r}, ${c2.g}, ${c2.b}))`;

    // 该函数在两种rgb颜色之间转换
    // This function transitions between two rgb colors
    const getColor = function (pct, colorSet) {
      for (let i = 1; i < colorSet.length - 1; i++) {
        if (pct < colorSet[i].pct) {
          break;
        }
      }
      // This conversion figures out the transition between two rgb values
      const lower = colorSet[0];
      const upper = colorSet[1];
      const range = upper.pct - lower.pct;
      const rangePct = (pct - lower.pct) / range;
      const pctLower = 1 - rangePct;
      const pctUpper = rangePct;
      const color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
      };
      // And returns the rgb code
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
    };

    // This is our animation which we run on hover
    const animateGradient = function () {
      if (intervalFrame === undefined) {
        intervalFrame = setInterval(() => {
          const time = transitionTime / 1000; // time in seconds
          const numberOfFrames = time * 60; // 60 frames per second -> 1 second = 60 frames

          // If the animation is going forward
          if (animationDirection === "forwards") {
            // Add 1 to elapsed
            elapsed += 1;
            // The elapsed frames out of max frames
            currentPct = Math.min(elapsed / numberOfFrames, 1) * 100;
          } else {
            // Otherwise we're going back - subtract 1 from ellapsed
            elapsed -= 1;
            // The elapsed frames out of max frames
            currentPct = Math.max(elapsed / numberOfFrames, 0) * 100;
          }

          // Calculate current color in this time for each gradient color
          const colorOne = getColor(currentPct, gradientStopOne);
          const colorTwo = getColor(currentPct, gradientStopTwo);

          // Generate CSS string
          // Add it to our background.
          divRef.style.backgroundImage = `linear-gradient(${angle}deg, ${colorOne}, ${colorTwo})`;

          // End the interval when we're done
          if (currentPct === 100 || currentPct === 0) {
            clearInterval(intervalFrame);
            intervalFrame = undefined;
          }
        }, fps); // 60 frames per second
      }
    };

    // animationDirection = 'backwards';
    animationDirection = direction;
    animateGradient();
  };

  // const newRandomColor = () => {
  //   return (randomColor({ type: "rgb", num: 0 }) as String).split(
  //     ","
  //   ) as Number[];
  // };

  let fromColor = [
    [141, 226, 226],
    [69, 144, 157]
  ];

  const toColor = [
    [87, 204, 153],
    [199, 249, 204]
  ];
  // fromColor[0] = newRandomColor();
  // fromColor[1] = newRandomColor();
  //
  // toColor[0] = newRandomColor();
  // toColor[1] = newRandomColor();

  const switchColor = (newColor: Number[][]) => {
    console.log("切换");
    // toColor[0] = newColor[0] ?? newRandomColor();
    // toColor[1] = newColor[1] ?? newRandomColor();
    toColor[0] = newColor[0];
    toColor[1] = newColor[1];
    console.log(toColor, "toColor");
    console.log(newColor[0], "newColor");
    console.log(newColor[1], "newColor");

    gradualTransitionColor(fromColor, toColor, bgColor.value, "forwards");
    fromColor = toColor;
  };
  return {
    switchColor
  };
}
