particlesJS('particles-js', {
  particles: {
    number: {
      value: 600,
      density: {
        enable: true,
        value_area: 1000
      }
    },
    color: {
      value: ['#FFD700', '#DAA520', '#FDB931', '#FFE55C']
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0
      }
    },
    opacity: {
      value: 0.3,
      random: true,
      anim: {
        enable: true,
        speed: 1,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 2,
      random: true,
      anim: {
        enable: true,
        speed: 1,
        size_min: 0.1,
        sync: false
      }
    },
    line_linked: {
      enable: false
    },
    move: {
      enable: true,
      speed: 3,
      direction: "top-right",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: true,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detect_on: "window",
    events: {
      onhover: {
        enable: true,
        mode: "repulse"
      },
      onclick: {
        enable: false
      },
      resize: true
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.3
      }
    }
  },
  retina_detect: false
});