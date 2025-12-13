import React, { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Mail, FileText, Box, Cpu, PenTool, X, ChevronRight, Menu, ArrowLeft, ExternalLink, Check, Camera, Image as ImageIcon, PlayCircle, Film, Maximize2, MapPin, Calendar } from 'lucide-react';

/**
 * UTILITY: Helper to resolve image paths for GitHub Pages
 */
const resolvePath = (path) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? path.slice(1) : path;
};

/**
 * UTILITY: Helper to convert standard YouTube links to Embed links
 */
const getYouTubeEmbedUrl = (url) => {
    if (!url) return undefined;
    
    // Handle standard watch URLs (e.g. https://www.youtube.com/watch?v=VIDEO_ID)
    if (url.includes('watch?v=')) {
        const videoId = url.split('watch?v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle short URLs (e.g. https://youtu.be/VIDEO_ID)
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Return as is if it's already an embed link or another source
    return url;
};

/**
 * UTILITY: Script Loader for Three.js
 */
const useThreeScripts = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.THREE) {
      setLoaded(true);
      return;
    }

    const loadThree = async () => {
      try {
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        threeScript.async = true;
        document.body.appendChild(threeScript);

        await new Promise((resolve) => { threeScript.onload = resolve; });

        const stlScript = document.createElement('script');
        stlScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js';
        stlScript.async = true;
        document.body.appendChild(stlScript);

        await new Promise((resolve) => { stlScript.onload = resolve; });

        setLoaded(true);
      } catch (e) {
        console.error("Failed to load 3D libraries", e);
      }
    };

    loadThree();
  }, []);

  return loaded;
};

/**
 * COMPONENT: 3D Background / STL Viewer
 */
const ThreeCanvas = () => {
  const containerRef = useRef(null);
  const scriptsLoaded = useThreeScripts();

  useEffect(() => {
    if (!scriptsLoaded || !containerRef.current) return;

    const WIDTH = containerRef.current.clientWidth;
    const HEIGHT = containerRef.current.clientHeight;

    const scene = new window.THREE.Scene();
    scene.background = new window.THREE.Color(0xf9fafb); 
    scene.fog = new window.THREE.Fog(0xf9fafb, 10, 50);

    const camera = new window.THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 10;
    camera.lookAt(0, 0, 0);

    const renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const hemiLight = new window.THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const setupMesh = (mesh) => {
        const material = new window.THREE.MeshStandardMaterial({ 
            color: 0xe5e7eb, 
            roughness: 0.6,
            metalness: 0.1
        });
        mesh.material = material;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const box = new window.THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new window.THREE.Vector3());
        const size = box.getSize(new window.THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDim; 
        
        mesh.scale.set(scale, scale, scale);
        mesh.position.x = -center.x * scale;
        mesh.position.y = -center.y * scale;
        mesh.position.z = -center.z * scale;
        
        const group = new window.THREE.Group();
        group.add(mesh);
        scene.add(group);
        return group;
    };

    const geometry = new window.THREE.TorusKnotGeometry(4, 1.2, 128, 32);
    const mesh = new window.THREE.Mesh(geometry);
    const currentMesh = setupMesh(mesh);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (currentMesh) {
          currentMesh.rotation.y += 0.005;
          currentMesh.rotation.x += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!containerRef.current) return;
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', handleResize);
        if (containerRef.current) containerRef.current.innerHTML = '';
        renderer.dispose();
    };
  }, [scriptsLoaded]);

  return <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />;
};

/**
 * DATA: Portfolio Projects
 */
const projects = [
    // --- ENGINEERING PROJECTS ---
    {
        id: 'cnc',
        category: 'Engineering',
        title: 'Custom CNC Machine',
        subtitle: 'University of Toronto',
        description: 'Large-format 3-axis CNC router with 229 parts and 400+ mates.',
        what: [
            "Designed and modelled a large-format three-axis CNC router with a combination of custom-designed parts and McMaster-Carr components.",
            "The objective was to maximize utility, modularity, and repairability while keeping costs low."
        ],
        how: [
            "Researched components to optimize for cost-efficiency and performance based on design specifications.",
            "Developed and delivered Google Slides to communicate key design features and trade-offs, effectively securing approval during engineering design briefing."
        ],
        outcome: [
            "Designed and modelled a custom CNC router with 229 parts and 400+ mates in SolidWorks.",
            "Created a comprehensive design report, including engineering specifications, component justification and a bill of materials outlining all components required to assemble the router."
        ],
        tags: ['SolidWorks', 'Mechatronics', 'Design for Assembly'],
        icon: <Cpu className="w-6 h-6" />,
        images: ['/images/cnc-1.jpg', '/images/cnc-2.jpg', '/images/cnc-3.jpg']
    },
    {
        id: 'ir-holder',
        category: 'Engineering',
        title: 'IR Camera Holder',
        subtitle: 'LEMAM',
        description: 'Adjustable lens mount and fixture for a $27,000 IR camera.',
        what: [
            "Designed an adjustable lens mount and fixture for a $27,000 IR camera.",
            "The objective was to create a stable fixture that had smooth motion and fast print times."
        ],
        how: [
            "Designed a cap with standardized Sony threads to mount lens filter onto IR Camera.",
            "Measured mounting hole dimensions on DED machine for design.",
            "Created fixture to combine IR camera with linear guide which was mounted to the DED machine."
        ],
        outcome: [
            "IR camera now has 50+mm of travel along the Z-axis for focusing.",
            "IR camera is stable, with less than 2mm of wobble when secured.",
            "Net print time of under 2 hours on the Prusa i3 mk3s+."
        ],
        tags: ['Precision Design', '3D Printing', 'Fixture Design'],
        icon: <Cpu className="w-6 h-6" />,
        images: ['/images/ir-holder-1.jpg', '/images/ir-holder-2.jpg', '/images/ir-holder-3.jpg']
    },
    {
        id: 'chess-board',
        category: 'Engineering',
        title: 'LED Embedded Chess Board',
        subtitle: 'Spark! Design Team',
        description: 'Ultra-thin (7.7mm) chessboard with 1024+ embedded LEDs.',
        what: [
            "Designed an LED-embedded chessboard for my design team's Smart Chess project.",
            "The objective was to optimize the board thickness, ensuring structural strength while maintaining a thin profile for reliable magnetic attraction on opposite sides of the board.",
            "Light from LEDs also had to diffuse minimally between board pieces."
        ],
        how: [
            "Designed a system with three layers: a topper that connected to other toppers and prevented light bleed to other positions, a diffusion layer and a layer for holding LED strips.",
            "Used OnShape to prototype and test 10+ iterations during the design process.",
            "Tested light diffusion using the FastLED Arduino library."
        ],
        outcome: [
            "Designed and manufactured a LED-embedded chessboard with a thickness of 7.7mm and a deflection of less than 2mm.",
            "Chessboard contains 1024+ LEDS with little to no light diffusing between the grids."
        ],
        tags: ['Electronics', 'OnShape', 'Firmware', 'FastLED'],
        icon: <Cpu className="w-6 h-6" />,
        images: ['/images/chess-board-1.jpg', '/images/chess-board-2.jpg', '/images/chess-board-3.jpg']
    },
    {
        id: 'keyboard',
        category: 'Engineering',
        title: '3x3 Custom Keyboard',
        subtitle: 'Personal Project',
        description: 'Macro-pad designed to optimize SolidWorks workflow.',
        what: [
            "Designed a custom keyboard for optimizing my workflow in SolidWorks.",
            "The objective was to increase efficiency while maintaining an intuitive and visually appealing design."
        ],
        how: [
            "Designed a 3D-printed enclosure with heat inserts to mount a microcontroller, rotary encoder, and OLED screen.",
            "Designed and ordered a custom PCB for the switches using KICAD.",
            "Developed custom firmware for communication between components."
        ],
        outcome: [
            "Created a custom macropad with 39+ programmable functions.",
            "Gained end-to-end product design experience, from CAD modelling to electronics integration and firmware development."
        ],
        tags: ['KiCad', 'PCB Design', 'Firmware', 'Product Design'],
        icon: <PenTool className="w-6 h-6" />,
        images: ['/images/macro/macro3.jpg', '/images/macro/macro2.jpg', '/images/macro/macro1.png']
    },
    {
        id: 'frame',
        category: 'Engineering',
        title: 'Smart Digital Frame',
        subtitle: 'Personal Project',
        description: 'A dual-purpose digital photo frame and external monitor.',
        what: [
            "Designed a smartphone-controllable digital photo frame that can double as an external monitor.",
            "The objective was to maximize utility while keeping the design simple and unobtrusive on the desk."
        ],
        how: [
            "Researched and learned how to woodwork with hand drills and saws to create the enclosure.",
            "Learned Python to adapt and debug scripts from GitHub.",
            "Created an enclosure that integrated a Raspberry Pi, cooling fan, 11\" monitor, HDMI switcher, and monitor control board."
        ],
        outcome: [
            "Digital photo frame with 32GB of expandable storage using USB ports.",
            "Photo frame features can be controlled by connecting the phone to the local network."
        ],
        tags: ['Python', 'Woodworking', 'IoT', 'Raspberry Pi'],
        icon: <PenTool className="w-6 h-6" />,
        images: ['/images/frame-1.jpg', '/images/frame-2.jpg', '/images/frame-3.jpg']
    },
    {
        id: 'airpods',
        category: 'Engineering',
        title: 'AirPods Dock',
        subtitle: 'Personal Project',
        description: 'Print-in-place charging dock mechanism designed for intuitive use.',
        what: [
            "Designed and modelled a custom dock and charger for my AirPods Pro to encourage myself to charge my AirPods more.",
            "The objective was to maximize access speed, intuitivity and simplicity."
        ],
        how: [
            "Researched and developed a print-in-place mechanism so that the entire part can be printed without assembly, despite containing two separate parts.",
            "Designed and modelled 2 prototypes to ensure perfect fit for Magsafe Charger and Airpods."
        ],
        outcome: [
            "My AirPods have always been charged before leaving the house for the past 6 months.",
            "All relevant files and print instructions are open-source on Thingiverse."
        ],
        tags: ['Mechanism Design', 'Rapid Prototyping', 'Thingiverse'],
        icon: <PenTool className="w-6 h-6" />,
        images: ['/images/airpods-1.jpg', '/images/airpods-2.jpg', '/images/airpods-3.jpg']
    },
    {
        id: 'chess-pieces',
        category: 'Engineering',
        title: 'Poly Chess Pieces',
        subtitle: 'Spark! Design Team',
        description: 'Low-poly aesthetic chess pieces designed to house internal magnets.',
        what: [
            "Designed four unique chess pieces with internal magnets for my team's Smart Chess project.",
            "The objective was to design something with a low-poly aesthetic that could house internal magnets."
        ],
        how: [
            "Designed and modelled the chess pieces in Blender.",
            "Created renders of the design in Blender for marketing purposes.",
            "Created a Blender to SolidWorks workflow to utilize both organic modelling and technical refinement across both software tools.",
            "Designed a 3D printable clip-on cover and magnet slots within SolidWorks."
        ],
        outcome: [
            "Marketing renders and functional magnetic prototypes."
        ],
        tags: ['Blender', 'Surface Modelling', 'Rendering'],
        icon: <PenTool className="w-6 h-6" />,
        images: ['/images/chess-pieces-1.jpg', '/images/chess-pieces-2.jpg', '/images/chess-pieces-3.jpg']
    },
     {
        id: 'hair-dryer',
        category: 'Engineering',
        title: 'Hair Dryer Holder',
        subtitle: 'Personal Project',
        description: 'Minimalist bathroom organizer designed for support-free 3D printing.',
        what: [
            "Designed a hair dryer holder so that I can hide my hair dryer within my bathroom closet.",
            "The objective was to design something with sufficient support while remaining simple and fast to print."
        ],
        how: [
            "Measured and modelled hair dryer to test fitting within a SolidWorks Assembly.",
            "Strategically designed model to ensure no supports were needed, thus saving filament and keeping print times low."
        ],
        outcome: [
            "Space beside bathroom sink is now 50% less cluttered.",
            "Project received positive feedback, with 47 likes and 8 saves on Thingiverse."
        ],
        tags: ['Consumer Goods', 'FDM Printing', 'Optimization'],
        icon: <PenTool className="w-6 h-6" />,
        images: ['/images/hair-dryer-1.jpg', '/images/hair-dryer-2.jpg', '/images/hair-dryer-3.jpg']
    },

    // --- OTHER PROJECTS (CREATIVE / VIDEO) ---    
    {
        id: 'stop-motion',
        category: 'Other',
        title: 'Stop Motion Animation',
        subtitle: 'Creative Project',
        description: 'A frame-by-frame storytelling experience using physical mediums.',
        what: [
            "Created a short stop-motion film utilizing physical objects and lighting techniques.",
            "Explored the principles of animation including timing, spacing, and squash-and-stretch."
        ],
        how: [
            "Set up a consistent lighting rig to ensure continuity between frames.",
            "Captured hundreds of individual photos and sequenced them using editing software."
        ],
        outcome: [
            "Produced a fluid animation that brings inanimate objects to life."
        ],
        tags: ['Animation', 'Photography', 'Storytelling'],
        icon: <Film className="w-6 h-6" />,
        video: '', 
        images: [] 
    },
    {
        id: 'bc-zoom',
        category: 'Other',
        title: 'BC ZOOM Film Festival',
        subtitle: 'Short Film Entry',
        description: 'An award-winning short film created for the BC ZOOM Film Festival.',
        what: [
            "Wrote, directed, and edited a short film under strict time constraints.",
            "Focused on narrative structure and visual storytelling."
        ],
        how: [
            "Coordinated a small team of actors and crew members.",
            "Utilized Premiere Pro for color grading and sound design."
        ],
        outcome: [
            "Showcased at the festival and received positive reception for cinematography."
        ],
        tags: ['Filmmaking', 'Directing', 'Editing'],
        icon: <Film className="w-6 h-6" />,
        video: '', 
        images: [] 
    },
    {
        id: 'blender-anim',
        category: 'Other',
        title: 'Blender Animations',
        subtitle: '3D Motion Graphics',
        description: 'Experimental 3D animations focusing on physics simulations and lighting.',
        what: [
            "Created looping 3D animations to explore Blender's physics engine.",
            "Focused on satisfying motion and realistic material rendering."
        ],
        how: [
            "Modeled assets in Blender and applied procedural textures.",
            "Simulated rigid body dynamics and cloth physics."
        ],
        outcome: [
            "A series of high-quality renders demonstrating proficiency in 3D animation pipelines."
        ],
        tags: ['Blender', '3D Animation', 'Rendering'],
        icon: <Box className="w-6 h-6" />,
        video: '', 
        images: [] 
    },
    {
        id: 'batarang',
        category: 'Other',
        title: 'Custom 3D Rendered Batarang',
        subtitle: 'Prop Design',
        description: 'A photorealistic render of a custom-designed Batarang prop.',
        what: [
            "Designed a stylized Batarang inspired by various comic book iterations.",
            "Aimed for a gritty, realistic metal aesthetic."
        ],
        how: [
            "Modeled the hard-surface geometry in Blender.",
            "Used substance painting techniques to add scratches, wear, and surface imperfections."
        ],
        outcome: [
            "High-fidelity 4K renders suitable for portfolio display."
        ],
        tags: ['3D Modeling', 'Texturing', 'Prop Design'],
        icon: <PenTool className="w-6 h-6" />,
        video: '', 
        images: ['/images/batarang-1.jpg'] 
    }
];

/**
 * DATA: Photography Trips
 */
const photographyTrips = [
    {
        id: 'west-coast',
        location: 'West Coast, US',
        date: 'August 2025',
        photos: [
            { src: '/images/photography/wCoast/w1.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w2.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w3.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w4.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w5.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w6.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w7.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w8.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w9.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w10.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w11.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w12.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w13.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w14.jpg', alt: 'West Coast' },
            { src: '/images/photography/wCoast/w15.jpg', alt: 'West Coast' }
        ]
    },
    {
        id: 'niagara',
        location: 'Niagara, Canada',
        date: 'May 2025',
        photos: [
            // Add your photos here
            { src: '/images/photography/niagara/n1.jpg', alt: 'Niagara' },
            { src: '/images/photography/niagara/n2.jpg', alt: 'Niagara' },
            { src: '/images/photography/niagara/n3.jpg', alt: 'Niagara' },
            { src: '/images/photography/niagara/n4.jpg', alt: 'Niagara' },
            { src: '/images/photography/niagara/n5.jpg', alt: 'Niagara' },
            { src: '/images/photography/niagara/n6.jpg', alt: 'Niagara' },
            { src: '/images/photography/niagara/n7.jpg', alt: 'Niagara' }
        ]
    }
    // Add more trips here...
];

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null); 
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  
  // Photography Section State
  const scrollContainerRef = useRef(null);
  const [activeTripId, setActiveTripId] = useState(photographyTrips[0]?.id);

  const engineeringProjects = projects.filter(p => p.category === 'Engineering');
  const otherProjects = projects.filter(p => p.category === 'Other');

  // Derive the current trip object for the header
  const activeTrip = photographyTrips.find(t => t.id === activeTripId) || photographyTrips[0];

  const handleNavClick = (section) => {
    setActiveSection(section);
    setSelectedProject(null); 
    setSelectedPhoto(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyEmail = () => {
    const email = "thealec.chen@mail.utoronto.ca";
    const textArea = document.createElement("textarea");
    textArea.value = email;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email', err);
    }
    document.body.removeChild(textArea);
  };

  // Scroll to a specific trip
  const scrollToTrip = (tripId) => {
      const container = scrollContainerRef.current;
      const element = container?.querySelector(`[data-trip-id="${tripId}"]`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', inline: 'start' });
      }
  };

  // Effect to handle scroll wheel mapping (Vertical -> Horizontal)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || activeSection !== 'photography') return;

    const handleWheel = (e) => {
        // We only want to hijack vertical scrolling (deltaY)
        // If the user has a touchpad and scrolls horizontally (deltaX), let nature take its course.
        // We preventDefault ONLY if we are manually scrolling.
        if (e.deltaY !== 0) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [activeSection]);

  // Effect to update Active Dot on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || activeSection !== 'photography') return;

    const handleScroll = () => {
        const tripGroups = container.querySelectorAll('[data-trip-id]');
        
        tripGroups.forEach(group => {
            const rect = group.getBoundingClientRect();
            // Check if the group is roughly in the center or visible part of screen
            // Logic: if the left edge is within the first half of the screen OR
            // if the group takes up most of the screen
            if (rect.left >= 0 && rect.left < window.innerWidth / 2) {
                const tripId = group.getAttribute('data-trip-id');
                setActiveTripId(tripId);
            }
        });
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const NavLink = ({ to, label }) => (
    <button 
        onClick={() => handleNavClick(to)}
        className={`text-sm font-medium transition-colors ${activeSection === to && !selectedProject ? 'text-blue-600' : 'text-gray-600 hover:text-black'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden flex flex-col">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="font-bold text-xl tracking-tight flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavClick('home')}
          >
            <Box className="w-6 h-6 text-blue-600" />
            <span>ALEC CHEN</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="home" label="Home" />
            <NavLink to="engineering" label="Engineering" />
            <NavLink to="photography" label="Photography" />
            <NavLink to="other" label="Other Projects" />
            <NavLink to="contact" label="Contact" />
          </div>

          {/* Mobile Nav Toggle */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
              <div className="md:hidden absolute w-full bg-white border-b px-6 py-4 flex flex-col gap-4 shadow-lg">
                <button onClick={() => handleNavClick('home')} className="text-left font-medium text-gray-600 py-2">Home</button>
                <button onClick={() => handleNavClick('engineering')} className="text-left font-medium text-gray-600 py-2">Engineering</button>
                <button onClick={() => handleNavClick('photography')} className="text-left font-medium text-gray-600 py-2">Photography</button>
                <button onClick={() => handleNavClick('other')} className="text-left font-medium text-gray-600 py-2">Other Projects</button>
                <button onClick={() => handleNavClick('contact')} className="text-left font-medium text-gray-600 py-2">Contact</button>
             </div>
        )}
      </nav>

      {/* Main Content Router */}
      <main className={`flex-grow pt-16 ${activeSection === 'photography' ? 'h-screen overflow-hidden' : 'overflow-y-auto'}`}>
        
        {/* SECTION: HOME */}
        {activeSection === 'home' && (
            <div className="relative">
                <div className="h-[80vh] w-full relative overflow-hidden bg-gray-50 flex items-center justify-center">
                    <ThreeCanvas />
                    <div className="absolute inset-0 flex flex-col justify-center items-start max-w-6xl mx-auto px-6 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 pointer-events-auto max-w-lg">
                            <span className="text-blue-600 font-semibold tracking-wider text-sm mb-2 block">MECHANICAL ENGINEER</span>
                            <h1 className="text-5xl font-bold mb-4 text-gray-900 tracking-tight leading-tight">
                                Designing for <br/> <span className="text-gray-400">Function & Form.</span>
                            </h1>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                I bridge the gap between complex engineering systems and intuitive user experiences. 
                                Based in Toronto, visualizing ideas in 3D.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleNavClick('engineering')}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                                >
                                    View Engineering
                                </button>
                                <a 
                                    href={resolvePath('/resume.pdf')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <FileText size={18} />
                                    View Resume
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-400">
                       <ChevronRight className="rotate-90 w-6 h-6" />
                    </div>
                </div>
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-8">About Me</h2>
                        <p className="text-xl text-gray-600 leading-relaxed font-light">
                            I am a mechanical engineer at the University of Toronto with a passion for product design and rapid prototyping.
                            Whether it's a precision fixture for a $27,000 camera or a custom keyboard for my desk, 
                            I apply the same level of rigorous detail and creativity.
                        </p>
                    </div>
                </section>
            </div>
        )}

        {/* SECTION: ENGINEERING */}
        {activeSection === 'engineering' && (
            <div className="min-h-screen">
                {!selectedProject ? (
                    <div className="max-w-6xl mx-auto px-6 py-12">
                        <div className="mb-12 border-b border-gray-100 pb-6">
                            <h1 className="text-4xl font-bold mb-2">Engineering</h1>
                            <p className="text-gray-500">Technical challenges, mechatronics, and precision design.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {engineeringProjects.map((project) => (
                                <ProjectCard 
                                    key={project.id} 
                                    project={project} 
                                    onClick={() => {
                                        setSelectedProject(project);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
                )}
            </div>
        )}

        {/* SECTION: OTHER PROJECTS */}
        {activeSection === 'other' && (
            <div className="min-h-screen">
                {!selectedProject ? (
                    <div className="max-w-6xl mx-auto px-6 py-12">
                        <div className="mb-12 border-b border-gray-100 pb-6">
                            <h1 className="text-4xl font-bold mb-2">Other Projects</h1>
                            <p className="text-gray-500">Creative explorations, film, and animation.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {otherProjects.map((project) => (
                                <ProjectCard 
                                    key={project.id} 
                                    project={project} 
                                    onClick={() => {
                                        setSelectedProject(project);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
                )}
            </div>
        )}

        {/* SECTION: PHOTOGRAPHY (UPDATED: Dot Navigation + Dynamic Header) */}
        {activeSection === 'photography' && (
            <div className="h-[calc(100vh-4rem)] bg-white relative overflow-hidden">
                
                {/* Dynamic Header - Top Left */}
                <div className="absolute top-8 left-24 z-40 pointer-events-none">
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight transition-all duration-500">
                        {activeTrip.location}
                    </h2>
                    <p className="text-xl text-gray-500 font-light flex items-center gap-2 mt-1 transition-all duration-500">
                        <Calendar size={18} />
                        {activeTrip.date}
                    </p>
                </div>

                {/* Fixed Left Dot Navigation */}
                <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col justify-center items-center gap-4 w-16 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    {photographyTrips.map((trip) => (
                        <div key={trip.id} className="group relative flex items-center">
                            {/* Label on Hover */}
                            <span className="absolute left-full ml-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {trip.location}
                            </span>
                            
                            {/* Dot Button */}
                            <button 
                                onClick={() => scrollToTrip(trip.id)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${activeTripId === trip.id ? 'bg-gray-900 scale-125' : 'bg-gray-300 hover:bg-gray-500'}`}
                                aria-label={`Scroll to ${trip.location}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Horizontal Scroll Container */}
                <div 
                    ref={scrollContainerRef}
                    // IMPORTANT: removed 'scroll-smooth' because it fights with manual JS scrolling
                    className="flex h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-proximity items-center px-8"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
                >
                    {photographyTrips.map((trip) => (
                        <div key={trip.id} className="flex flex-nowrap gap-4 h-[70vh] items-center flex-shrink-0 mr-24" data-trip-id={trip.id}>
                            {trip.photos.map((photo, index) => (
                                <div 
                                    key={index} 
                                    className="h-full aspect-[2/3] md:aspect-[3/4] lg:aspect-auto min-w-[30vw] relative group snap-center rounded-sm overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    <img 
                                        src={resolvePath(photo.src)} 
                                        alt={photo.alt}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.style.display = 'none'; 
                                            e.target.nextSibling.style.display = 'flex'; // Show placeholder
                                        }}
                                    />
                                    {/* Placeholder if image fails */}
                                    <div className="hidden absolute inset-0 bg-gray-100 flex-col items-center justify-center text-gray-300 p-8 text-center">
                                        <ImageIcon size={48} className="mb-4" />
                                        <span className="text-sm font-mono break-all">{photo.src}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                    
                    {/* Padding for end of scroll */}
                    <div className="w-[20vw] flex-shrink-0"></div>
                </div>
                
                {/* Scroll Hint */}
                <div className="absolute bottom-8 right-8 z-30 animate-pulse text-gray-400 flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <ChevronRight className="w-5 h-5" />
                </div>

                {/* Lightbox Overlay */}
                {selectedPhoto && (
                    <div 
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button 
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>
                        
                        <div className="max-w-7xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
                            <img 
                                src={resolvePath(selectedPhoto.src)} 
                                alt={selectedPhoto.alt}
                                className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl"
                            />
                            <p className="text-white/80 text-center mt-4 font-medium tracking-wide">
                                {selectedPhoto.caption}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* SECTION: CONTACT */}
        {activeSection === 'contact' && (
            <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-4xl mx-auto px-6 text-center">
                <h1 className="text-5xl font-bold mb-8">Let's Build Something.</h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl">
                    I'm currently looking for opportunities in product design and mechanical engineering. 
                    If you have a project in mind or just want to chat about custom keyboards, feel free to reach out.
                </p>
                <div className="flex flex-col md:flex-row gap-6 mb-16">
                    <button 
                        onClick={handleCopyEmail}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all hover:-translate-y-1 shadow-lg ${emailCopied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    >
                        {emailCopied ? <Check /> : <Mail />}
                        {emailCopied ? 'Email Copied!' : 'Email Me'}
                    </button>
                    <a href="https://linkedin.com/in/thealecchen" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-sm">
                        <Linkedin />
                        LinkedIn
                    </a>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-sm">
                        <Github />
                        GitHub
                    </a>
                </div>
            </div>
        )}

      </main>

      {activeSection !== 'photography' && (
          <footer className="py-8 border-t border-gray-100 bg-gray-50 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Alec Chen. Designed & Built with React & Three.js.</p>
          </footer>
      )}

    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const ProjectCard = ({ project, onClick }) => (
    <div 
        onClick={onClick}
        className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
        <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            {project.images && project.images[0] ? (
                <img 
                    src={resolvePath(project.images[0])} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="text-gray-300 group-hover:text-blue-500 transition-colors duration-500 transform group-hover:scale-110">
                        {project.icon}
                    </div>
                </>
            )}
            
            <div className="absolute bottom-3 left-3">
                 <span className={`text-xs font-bold px-2 py-1 rounded bg-white/80 backdrop-blur-sm border border-gray-100 ${project.category === 'Engineering' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {project.category}
                </span>
            </div>
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                    {project.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                    {project.subtitle}
                </p>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

const ProjectDetail = ({ project, onBack }) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* Navigation / Header */}
        <div className="bg-white sticky top-16 z-40 border-b border-gray-100 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Projects
                </button>
                <div className="flex gap-3">
                    {project.tags.map(tag => (
                        <span key={tag} className="hidden md:inline-block px-2 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded text-xs">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
            
            {/* Title Block */}
            <div className="mb-12 max-w-3xl">
                {/* Category Tag Removed as requested */}
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-2 leading-tight">
                    {project.title}
                </h1>
                <p className="text-xl text-gray-500 font-medium">{project.subtitle}</p>
            </div>

            {/* MEDIA SECTION: Video or Grid */}
            {project.video ? (
                <div className="mb-16 aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-black">
                    <iframe 
                        className="w-full h-full"
                        src={getYouTubeEmbedUrl(project.video)} 
                        title={project.title} 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                    {/* Main Image */}
                    <div className="md:col-span-2 aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        {project.images && project.images[0] ? (
                            <img src={resolvePath(project.images[0])} alt="Main View" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                {project.icon}
                            </div>
                        )}
                    </div>

                    {/* Secondary Images */}
                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        {project.images && project.images[1] ? (
                            <img src={resolvePath(project.images[1])} alt="Detail View 1" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Detail Shot 1</div>
                        )}
                    </div>

                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        {project.images && project.images[2] ? (
                            <img src={resolvePath(project.images[2])} alt="Detail View 2" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Detail Shot 2</div>
                        )}
                    </div>
                </div>
            )}

            {/* Project Content */}
            <div className="max-w-3xl mx-auto space-y-16">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">What?</h3>
                     <ul className="list-disc list-outside ml-4 space-y-2 text-lg text-gray-600 leading-relaxed">
                        {project.what.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">How?</h3>
                     <ul className="list-disc list-outside ml-4 space-y-2 text-lg text-gray-600 leading-relaxed">
                        {project.how.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Outcome</h3>
                     <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                         <ul className="list-disc list-outside ml-4 space-y-2 text-gray-800 leading-relaxed font-medium">
                            {project.outcome.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default App;