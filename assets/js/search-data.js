// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-media",
          title: "Media",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/press/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "Download my complete curriculum vitae as a PDF using the link on the right.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-optimizing-llms-faster-by-learning-connections-neuron-interaction-and-nowcasting-networks",
        
          title: 'Optimizing LLMs Faster by Learning Connections: Neuron Interaction and Nowcasting Networks <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/@BorisAKnyazev/optimizing-llms-faster-by-learning-connections-neuron-interaction-and-nowcasting-networks-d9a722309eab?source=rss-3bd901bbd24------2", "_blank");
          
        },
      },{id: "post-can-we-do-better-than-convolutional-neural-networks",
        
          title: 'Can we do better than Convolutional Neural Networks? <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/data-science/can-we-do-better-than-convolutional-neural-networks-46ed90fed807?source=rss-3bd901bbd24------2", "_blank");
          
        },
      },{id: "post-spectral-graph-convolution-explained-and-implemented-step-by-step",
        
          title: 'Spectral Graph Convolution Explained and Implemented Step By Step <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/data-science/spectral-graph-convolution-explained-and-implemented-step-by-step-2e495b57f801?source=rss-3bd901bbd24------2", "_blank");
          
        },
      },{id: "post-anisotropic-dynamic-spectral-and-multiscale-filters-defined-on-graphs",
        
          title: 'Anisotropic, Dynamic, Spectral and Multiscale Filters Defined on Graphs <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/data-science/tutorial-on-graph-neural-networks-for-computer-vision-and-beyond-part-2-be6d71d70f49?source=rss-3bd901bbd24------2", "_blank");
          
        },
      },{id: "post-tutorial-on-graph-neural-networks-for-computer-vision-and-beyond-part-1",
        
          title: 'Tutorial on Graph Neural Networks for Computer Vision and Beyond (Part 1) <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/@BorisAKnyazev/tutorial-on-graph-neural-networks-for-computer-vision-and-beyond-part-1-3d9fada3b80d?source=rss-3bd901bbd24------2", "_blank");
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather.html";
            },},{id: "news-nino-accepted-at-iclr-2025",
          title: 'NiNo accepted at ICLR 2025',
          description: "",
          section: "News",},{id: "news-gave-an-invited-talk-at-the-iclr-2025-workshop-on-weight-space-learning-see-slides-and-talk",
          title: 'Gave an invited talk at the ICLR 2025 Workshop on Weight Space Learning,...',
          description: "",
          section: "News",},{id: "news-two-papers-on-learning-to-optimize-celo-training-versatile-learned-optimizers-on-a-compute-diet-and-meta-learning-optimizers-for-communication-efficient-learning-accepted-to-tmlr",
          title: 'Two papers on learning to optimize (Celo: Training Versatile Learned Optimizers on a...',
          description: "",
          section: "News",},{id: "news-almost-free-modality-stitching-of-foundation-models-accepted-to-emnlp-2025-main-conference",
          title: '(Almost) Free Modality Stitching of Foundation Models accepted to EMNLP 2025 (Main Conference)...',
          description: "",
          section: "News",},{id: "projects-project-1",
          title: 'project 1',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project.html";
            },},{id: "projects-project-2",
          title: 'project 2',
          description: "a project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project.html";
            },},{id: "projects-project-3-with-very-long-name",
          title: 'project 3 with very long name',
          description: "a project that redirects to another website",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project.html";
            },},{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project.html";
            },},{id: "projects-project-5",
          title: 'project 5',
          description: "a project with a background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project.html";
            },},{id: "projects-project-6",
          title: 'project 6',
          description: "a project with no image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project.html";
            },},{id: "projects-project-7",
          title: 'project 7',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project.html";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project.html";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project.html";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%62%6F%72%6B%6E%79%61%7A [%61%74] %67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/boris-knyazev-39690948", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/BorisAKnyazev", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
