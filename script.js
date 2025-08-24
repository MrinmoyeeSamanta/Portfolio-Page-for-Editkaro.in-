    const CATEGORIES = [
      "All",
      "Short-form",
      "Long-form",
      "Gaming",
      "Football",
      "eCommerce Ads",
      "Documentary",
      "Color Grading",
      "Anime",
      "Ads"
    ];

    const VIDEOS = [
      {id:1,title:"30s Gym Reel — Fat Burn",category:"Short-form",client:"FitnessPro",src:"Videos/Gym.mp4",poster:"Photo/gym.jpg",date:"2025-08-01"},
      {id:2,title:"MacBook Unboxing — Full Review",category:"Long-form",client:"MacBook",src:"Videos/ub.mp4",poster:"Photo/tech.png",date:"2025-07-24"},
      {id:3,title:"Independence Day Sale - Special Offer",category:"eCommerce Ads",client:"mcaffeine",src:"Videos/sale.mp4",poster:"Photo/Ec.png",date:"2025-06-18"},
      {id:4,title:"Pro Gamer Highlights",category:"Gaming",client:"SUBWAY SURFERS",src:"Videos/Gaming.mp4",poster:"Photo/Gaming.png",date:"2025-06-10"},
      {id:5,title:"Match Highlight",category:"Football",client:"Star Sports",src:"Videos/Football edit.mp4",poster:"Photo/FB.png",date:"2025-05-30"},
      {id:6,title:"Street Food Documentary — Ep.1",category:"Documentary",client:"Tasty Taste",src:"Videos/St food.mp4",poster:"Photo/food.png",date:"2025-05-12"},
      {id:7,title:"Cinematic Color Grade — Forest",category:"Color Grading",client:"FilmLab",src:"Videos/FOREST.mp4",poster:"Photo/forest.png",date:"2025-04-25"},
      {id:8,title:"Anime AMV — Skybound",category:"Anime",client:"AMV Vault",src:"Videos/ANIME.mp4",poster:"Photo/Anime.webp",date:"2025-04-02"},
      {id:9,title:"UGC Ad — Skincare",category:"Ads",client:"LAR'S SKINCARE",src:"Videos/LC.mp4",poster:"Photo/Lar.jpeg",date:"2025-03-14"},
      {id:10,title:"Podcast Edit — Startup Talk",category:"Long-form",client:"FoundersPod",src:"Videos/ST.mp4",poster:"Photo/st.png",date:"2025-02-11"},
      {id:11,title:"Micro‑learning Reel — UI Tips",category:"Short-form",client:"DesignDose",src:"Videos/ML.mp4",poster:"Photo/mc.png",date:"2025-01-29"},
      {id:12,title:"Football Edits — Top 10 Goals",category:"Football",client:"League Central",src:"Videos/FB.mp4",poster:"Photo/Football.jpg",date:"2024-12-18"}
    ];

    const state = { q:"", category:"All", sort:"newest" };

    const qs = s=>document.querySelector(s);
    const grid = qs('#grid')

    // Build category chips
    const chips = qs('#chips');
    CATEGORIES.forEach(cat=>{
      const btn=document.createElement('button');
      btn.className='filter-btn' + (cat==='All'?' active':'');
      btn.textContent=cat; btn.setAttribute('data-cat',cat);
      btn.addEventListener('click',()=>{
        state.category=cat; [...chips.children].forEach(c=>c.classList.remove('active')); btn.classList.add('active');
        render();
      });
      chips.appendChild(btn);
    });

    // Search
    qs('#q').addEventListener('input', e=>{ state.q = e.target.value.toLowerCase().trim(); render(); });

    // Sort
    qs('#sort').addEventListener('change', e=>{ state.sort=e.target.value; render(); });

    // Theme toggle
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme) root.setAttribute('data-theme', savedTheme);
    qs('#themeToggle').addEventListener('click', ()=>{
      const next = root.getAttribute('data-theme')==='light' ? '' : 'light';
      if(next) root.setAttribute('data-theme', next); else root.removeAttribute('data-theme');
      localStorage.setItem('theme', root.getAttribute('data-theme')||'');
    });

    // Lazy load video src on hover/in-view
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const v = entry.target.querySelector('video[data-src]');
          if(v && !v.src){ v.src = v.dataset.src; }
        }
      })
    }, {rootMargin:'200px'});

    function sortItems(items){
      const copy=[...items];
      switch(state.sort){
        case 'oldest': copy.sort((a,b)=>new Date(a.date)-new Date(b.date)); break;
        case 'az': copy.sort((a,b)=>a.title.localeCompare(b.title)); break;
        case 'za': copy.sort((a,b)=>b.title.localeCompare(a.title)); break;
        default: copy.sort((a,b)=>new Date(b.date)-new Date(a.date));
      }
      return copy;
    }

    function filtered(){
      return sortItems(VIDEOS.filter(v=>{
        const matchCat = state.category==='All' || v.category===state.category;
        const q = state.q;
        const matchQ = !q || v.title.toLowerCase().includes(q) || v.client.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
        return matchCat && matchQ;
      }));
    }

    function cardTemplate(item){
      return `
        <article class="card" data-id="${item.id}">
          <div class="meta">
            <h3>${item.title}</h3>
            <p>Client: ${item.client}</p>
            <span>${item.category}</span>
          </div>
          <div class="thumb">
            <video muted preload="none" data-src="${item.src}" poster="${item.poster}" playsinline></video>
            <button class="mute-btn" data-mute>🔇</button>
          </div>
        </article>`;
    }

    function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }

    function render(){
      clear(grid);
      const items = filtered(); // use filtered() instead of always VIDEOS
      items.forEach(item=>{
        grid.insertAdjacentHTML('beforeend', cardTemplate(item));
      });
      document.querySelectorAll('video[data-src]').forEach(v=>observer.observe(v.closest('.card')));
    }
    render();



    // Lightbox logic
    const lb = qs('#lightbox');
    const lbVideo = qs('#lbVideo');
    const lbTitle = qs('#lbTitle');
    const lbClose = qs('#lbClose');

    function openLightbox(item){
      lbTitle.textContent=item.title;
      lbVideo.src=item.src; lbVideo.poster=item.poster; lbVideo.currentTime=0;
      lbVideo.controls = true;
      lbVideo.muted = false; 
      lb.classList.add('open'); lbVideo.play();
    }
    function closeLightbox(){ lb.classList.remove('open'); lbVideo.pause(); lbVideo.src=''; }
    document.addEventListener('click',(e)=>{
      const playBtn = e.target.closest('[data-play]');
      if(playBtn){
        const card = playBtn.closest('.card');
        const id = +card.dataset.id;
        const item = VIDEOS.find(v=>v.id===id);
        openLightbox(item);
      }
      if(e.target===lb) closeLightbox();
    });
    lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && lb.classList.contains('open')) closeLightbox(); });

    // Toggle mute/unmute
    document.addEventListener('click', e=>{
      const btn = e.target.closest('[data-mute]');
      if(btn){
        const video = btn.closest('.thumb').querySelector('video');
        video.muted = !video.muted;
        btn.textContent = video.muted ? "🔇" : "🔊";
        if(!video.paused) return;
        video.play().catch(()=>{});
      }
    });

    document.querySelector('#year').textContent = new Date().getFullYear();

  


