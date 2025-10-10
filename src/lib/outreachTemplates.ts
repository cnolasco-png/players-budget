import jsPDF from 'jspdf';

// Multiple Instagram DM Templates
export const INSTAGRAM_DM_TEMPLATES = {
  casual: {
    title: "Casual & Personal",
    content: `Hey [Brand]! 👋 I'm [Name], a tennis player from [City]. Love what you guys do with [specific product/campaign]. I'm competing in [upcoming tournament] and my audience would genuinely connect with your brand. Quick pilot idea: 1 reel + 2 stories showcasing [product] in my training routine. Could we chat about a small test run? 🎾`
  },
  
  professional: {
    title: "Professional Approach", 
    content: `Hi [Brand Team], I'm [Name], a [level] tennis player with [follower count] engaged followers. I've been following your brand and love your approach to [brand value]. I'm traveling to [cities] this season and think there's a great partnership opportunity. Would you be open to discussing a content collaboration? I can send over my media kit if helpful.`
  },
  
  valueFirst: {
    title: "Value-First Pitch",
    content: `Hey [Brand]! Just finished an amazing training session with [related product/activity]. I'm [Name], competing in [tournament level] and my audience is always asking about [relevant topic]. I create authentic content around [niche] - would love to feature [brand] if there's mutual interest. Quick call to explore ideas?`
  },
  
  localAngle: {
    title: "Local Connection",
    content: `Hi [Brand]! I'm [Name], a local tennis player from [City] competing at [level]. Love that you guys are based here too! I'm heading to tournaments in [cities] and my followers always want to know about local brands I support. Would love to chat about featuring you in my journey. Coffee sometime?`
  },
  
  storytelling: {
    title: "Story-Driven",
    content: `Hey [Brand], quick story: I was training yesterday and [relevant situation/story]. I'm [Name], a [level] tennis player, and moments like these are what I share with my [follower count] followers. They love authentic behind-the-scenes content. Think we could create something cool together around [theme]?`
  }
};

// Industry-Specific Email Templates
export const EMAIL_TEMPLATES_BY_INDUSTRY = {
  sportswear: {
    clothing: {
      subject: "Tennis athlete partnership — Performance & Style",
      body: `Hi [Brand Team],

I'm [Name], a [level] tennis player and I've been following your brand's commitment to high-performance athletic wear. Your [specific product line] really aligns with what I look for in competition gear.

About me:
• Current ranking: [Ranking] 
• Competing in: [Tournament schedule]
• Training base: [Location]
• Social reach: [Followers] engaged tennis community

What resonates with my audience:
• Performance gear that actually works under pressure
• Behind-the-scenes training content
• Honest product reviews from real athletes
• Style that transitions from court to lifestyle

Partnership ideas:
• Tournament gear testing and reviews
• Training day content featuring your apparel  
• Before/after competition outfit posts
• Social media takeovers during events

My followers trust my recommendations because I only work with brands I genuinely use. Would love to explore how we can authentically showcase your gear during my tournament season.

Best regards,
[Your Name] | [Email] | [Phone]
[Social handles]`
    },
    
    footwear: {
      subject: "Tennis athlete collaboration — Court performance footwear",
      body: `Hello [Brand Team],

I'm [Name], competing at the [level] level, and I'm reaching out because footwear is absolutely critical to my performance and injury prevention on court.

My tennis background:
• Playing surface: [Clay/Hard/Grass courts]
• Training intensity: [Hours per day/week]
• Competition schedule: [Number of tournaments]
• Current ranking: [Ranking]

Why my audience cares about tennis shoes:
• Performance and injury prevention
• Durability across different surfaces
• Style for court and casual wear
• Value for investment pieces

Content I create around footwear:
• Shoe testing on different court surfaces
• Durability reviews after tournaments
• Performance comparisons for different playing styles  
• Style content for tennis lifestyle

I'd love to test your [specific shoe line] during my upcoming [tournament/training block] and create authentic content around the experience. My followers appreciate honest reviews from someone who actually puts gear to the test.

Looking forward to exploring a partnership!

Best,
[Your Name]
[Contact information]`
    }
  },

  nutrition: {
    supplements: {
      subject: "Performance nutrition partnership — Tennis athlete",
      body: `Hi [Brand Team],

I'm [Name], a [level] tennis player, and nutrition is a cornerstone of my performance strategy. I've been researching your [product line] and I'm impressed by your approach to [specific aspect - clean ingredients/science-backed formulas/etc.].

My athletic profile:
• Competition level: [Level]
• Training schedule: [Intensity/frequency]
• Nutrition focus: [Performance/recovery/energy/etc.]
• Audience: [Follower count] health-conscious athletes

What my community values in nutrition:
• Science-backed performance benefits
• Clean, tested ingredients
• Real results from real athletes
• Practical nutrition for busy training schedules

Partnership opportunities:
• Pre/during/post-workout nutrition content
• Performance testing and honest reviews
• Educational content about sports nutrition
• Behind-the-scenes of my nutrition routine

I'm particularly interested in [specific products] for my [training/competition] needs. Would love to discuss a collaboration where I can authentically test and share results with my audience.

Best regards,
[Your Name]
[Contact details]`
    },
    
    hydration: {
      subject: "Hydration partnership — Competitive tennis athlete", 
      body: `Hello [Brand],

As a [level] tennis player competing in [climate/conditions], proper hydration is literally a performance and safety issue for me. I've been following your brand's innovation in [hydration technology/electrolyte science/etc.].

My tennis demands:
• Match duration: Often 2-3+ hours in heat
• Training intensity: [Hours] daily in [conditions]
• Competition schedule: [Tournament frequency]
• Recovery needs: Rapid rehydration between matches

Why hydration content resonates:
• My audience faces similar challenges (heat, long workouts)
• Performance impact is immediate and measurable
• Safety education around proper hydration
• Practical tips for different activity levels

Content ideas:
• Pre-match hydration routines
• During-match hydration strategies  
• Recovery hydration protocols
• Education on electrolyte balance
• Product testing in real competition conditions

I'd love to partner with you to create educational content that helps athletes at all levels optimize their hydration. Would you be interested in discussing a collaboration?

Best,
[Your Name]
[Contact information]`
    }
  },

  technology: {
    fitness: {
      subject: "Tennis performance tech partnership",
      body: `Hi [Brand Team],

I'm [Name], a [level] tennis player who's passionate about using technology to optimize performance. Your [product/app] caught my attention because of its focus on [specific feature - analytics/tracking/improvement/etc.].

My tech-forward approach:
• Current tools I use: [List current tech stack]
• Data I track: [Performance metrics you monitor]
• Competition level: [Level and ranking]
• Social reach: [Followers] who love tennis tech content

Why my audience engages with tech content:
• Always looking for competitive advantages
• Interested in data-driven improvement
• Early adopters of sports technology
• Value honest reviews from serious athletes

Partnership possibilities:
• Real-world testing during training and competition
• Performance data analysis and results sharing
• Educational content about sports technology
• Before/after improvement documentation
• Tech tips for recreational players

I'm particularly interested in testing [specific feature/product] during my [upcoming tournament/training block]. Would love to explore how we can showcase your technology's real-world impact.

Best regards,
[Your Name]
[Contact details]`
    },
    
    recovery: {
      subject: "Recovery tech collaboration — Professional tennis athlete",
      body: `Hello [Brand],

Recovery is where I gain my competitive edge, and I'm impressed by your [product/technology] approach to [recovery aspect - sleep/muscle recovery/etc.].

My recovery focus:
• Training load: [Intensity/frequency]  
• Competition schedule: [Tournament demands]
• Current recovery protocol: [What you currently do]
• Performance goals: [What you're optimizing for]

My audience's recovery challenges:
• Balancing intense training with proper recovery
• Maximizing limited recovery time
• Understanding recovery science
• Finding effective recovery tools

Content opportunities:
• Recovery routine breakdowns
• Technology testing and results
• Education on recovery science
• Day-in-the-life recovery content
• Performance impact documentation

I'd be interested in testing your [specific product] during my [training period/tournament season] and sharing the authentic results with my community. My followers trust my recommendations because I only promote what actually works.

Looking forward to discussing!

Best,
[Your Name]
[Contact information]`
    }
  },

  lifestyle: {
    travel: {
      subject: "Travel partnership — Touring tennis athlete",
      body: `Hi [Brand Team],

As a [level] tennis player, I travel to [number] tournaments annually, spending [time period] on the road. I've been following your brand and love your focus on [travel aspect - gear/experiences/convenience/etc.].

My travel profile:
• Annual travel: [Number of tournaments/cities]
• Travel style: [Tournament focused/exploration/etc.]
• Audience: [Followers] who follow my tennis journey
• Content focus: [Behind-the-scenes/destinations/etc.]

Travel content that performs well:
• Airport and travel day routines
• Tournament city exploration
• Travel gear that actually works for athletes
• International tournament experiences
• Travel tips for competitive athletes

Partnership ideas:
• Travel gear testing across different climates/countries
• Destination content from tournament cities
• Travel routine breakdowns
• Gear durability testing through heavy travel
• Travel tips collaboration

I'm particularly interested in [specific product/service] for my upcoming [tournament/travel schedule]. Would love to explore a partnership that showcases real travel experiences.

Best regards,
[Your Name]
[Travel schedule/Contact info]`
    },
    
    wellness: {
      subject: "Wellness partnership — Mind-body tennis performance",
      body: `Hello [Brand],

Tennis is as much mental as physical, and I'm drawn to your approach to [wellness aspect - mindfulness/stress management/holistic health/etc.].

My wellness approach:
• Training philosophy: [Holistic/mental training/etc.]
• Performance challenges: [Mental game/stress/etc.]
• Current practices: [Meditation/therapy/etc.]
• Competition level: [Level and mindset focus]

Why wellness content resonates:
• Athletes struggle with pressure and stress
• Performance anxiety is universal in sports
• Recovery includes mental recovery
• Audience seeks authentic wellness approaches

Content opportunities:
• Pre-match mental preparation routines
• Stress management during competition
• Wellness practices for athletes
• Mind-body performance connection
• Recovery and wellness integration

I'd love to explore how your [product/approach] fits into my competition preparation and share the journey authentically with my audience.

Best,
[Your Name]
[Contact information]`
    }
  }
};

// Professional 7-Day Outreach Plan Generator
export async function generateSevenDayPlan(): Promise<Blob> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  
  // Premium color palette matching the high-end sponsor templates
  const COLORS = {
    primary: { r: 18, g: 18, b: 61 },      // Deep navy - professional authority
    secondary: { r: 255, g: 193, b: 7 },   // Gold accent - luxury positioning
    accent: { r: 34, g: 197, b: 94 },      // Success green - performance
    text: { r: 31, g: 41, b: 55 },         // Rich dark gray
    lightGray: { r: 248, g: 250, b: 252 }, // Subtle background
    mediumGray: { r: 156, g: 163, b: 175 }, // Dividers
    white: { r: 255, g: 255, b: 255 },
    gradient1: { r: 18, g: 18, b: 61 },
    gradient2: { r: 30, g: 64, b: 175 }
  };
  
  const pageWidth = 595;
  const pageHeight = 842;
  
  // Premium header with gradient effect
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, pageWidth, 120, 'F');
  
  // Header accent line
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(0, 115, pageWidth, 5, 'F');
  
  // Main title
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.text("7-DAY SPONSOR OUTREACH", pageWidth/2, 45, { align: 'center' });
  
  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.text("Professional Action Plan for Tennis Athletes", pageWidth/2, 75, { align: 'center' });
  
  // Version indicator
  doc.setFontSize(10);
  doc.setTextColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.text("Premium Edition | Powered by Player's Budget", pageWidth/2, 95, { align: 'center' });
  
  let currentY = 160;
  
  // Professional overview section with premium styling
  doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.roundedRect(40, currentY - 10, pageWidth - 80, 100, 10, 10, 'F');
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("STRATEGIC OVERVIEW", 60, currentY + 15);
  
  // Premium divider line
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(2);
  doc.line(60, currentY + 25, 535, currentY + 25);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  const overview = [
    "This systematic 7-day approach transforms your sponsor outreach from random",
    "attempts into a professional, strategic process that builds lasting partnerships.",
    "Each day includes specific, actionable tasks designed to maximize your success",
    "while maintaining authenticity and genuine brand connections."
  ];
  
  overview.forEach((line, index) => {
    doc.text(line, 60, currentY + 45 + (index * 16), { maxWidth: 475 });
  });
  
  currentY += 130;
  
  // Premium daily breakdown with enhanced styling
  const dailyPlan = [
    {
      day: "DAY 1",
      title: "STRATEGIC RESEARCH & TARGETING",
      icon: "🎯",
      color: { r: 239, g: 68, b: 68 }, // Red
      tasks: [
        "Research 10 brands that align with your values and tennis career goals",
        "Analyze their current sponsorships and existing athlete partnerships", 
        "Identify key decision-makers on LinkedIn (Marketing Directors, Partnerships)",
        "Create organized contact database with all relevant information",
        "Prioritize top 5 brands based on alignment and opportunity level"
      ],
      notes: "Quality research is the foundation of successful partnerships. Focus on brands that genuinely fit your profile and values.",
      tip: "Use tools like LinkedIn Sales Navigator and company websites to find the right contacts."
    },
    {
      day: "DAY 2", 
      title: "AUTHENTIC SOCIAL ENGAGEMENT",
      icon: "📱",
      color: { r: 59, g: 130, b: 246 }, // Blue
      tasks: [
        "Follow target brands across all their social media platforms",
        "Engage thoughtfully with their recent posts (avoid generic comments)",
        "Share relevant brand content to your Instagram stories with genuine tags",
        "Study their current athlete partnerships and engagement strategies",
        "Document their brand voice, posting frequency, and content themes"
      ],
      notes: "Authentic engagement builds brand awareness before you pitch. Quality interactions matter more than quantity.",
      tip: "Comment with insights about their products or campaigns, not just emojis."
    },
    {
      day: "DAY 3",
      title: "DIRECT MESSAGE OUTREACH", 
      icon: "💬",
      color: { r: 168, g: 85, b: 247 }, // Purple
      tasks: [
        "Send personalized Instagram DMs to your top 3 priority brands",
        "Use conversational, authentic tone that reflects your personality",
        "Reference specific products, campaigns, or brand initiatives you admire",
        "Propose a small, low-risk pilot collaboration opportunity",
        "Track all outreach activities in your organized contact database"
      ],
      notes: "Keep DMs concise and personal. Focus on mutual value creation, not just follower counts.",
      tip: "Research recent brand campaigns to reference in your outreach for better connection."
    },
    {
      day: "DAY 4",
      title: "PROFESSIONAL EMAIL FOLLOW-UP",
      icon: "📧",
      color: { r: 34, g: 197, b: 94 }, // Green
      tasks: [
        "Send professional follow-up emails to brands contacted on Day 3",
        "Use industry-specific templates customized for each brand", 
        "Attach your media kit, tournament schedule, and partnership proposal",
        "Respond promptly to any DM responses or inquiries received",
        "Update contact database with all responses and next action items"
      ],
      notes: "Email demonstrates professionalism and allows for detailed partnership discussions.",
      tip: "Include specific ROI metrics and partnership benefits in your email proposals."
    },
    {
      day: "DAY 5",
      title: "STRATEGIC COLD OUTREACH",
      icon: "🎯",
      color: { r: 245, g: 158, b: 11 }, // Amber
      tasks: [
        "Research and contact 2 new high-potential brands via cold email",
        "Find specific partnership contact emails (avoid generic info@ addresses)",
        "Create compelling, brand-specific subject lines that stand out",
        "Include tournament schedule, audience demographics, and partnership ROI",
        "Set calendar reminders for professional follow-up sequences"
      ],
      notes: "Cold outreach succeeds through personalization and clear value propositions.",
      tip: "Reference recent brand news, campaigns, or achievements to show you're paying attention."
    },
    {
      day: "DAY 6",
      title: "RELATIONSHIP CULTIVATION",
      icon: "🤝",
      color: { r: 236, g: 72, b: 153 }, // Pink
      tasks: [
        "Continue meaningful engagement with all target brands' content",
        "Create and share authentic content featuring brands you genuinely support",
        "Tag brands strategically in relevant training, tournament, or lifestyle posts", 
        "Connect with brand marketing teams and athlete partnership managers on LinkedIn",
        "Research 5-10 additional brands for next week's outreach cycle"
      ],
      notes: "Long-term relationship building creates opportunities beyond immediate partnerships.",
      tip: "Share behind-the-scenes content showing authentic brand usage in your daily routine."
    },
    {
      day: "DAY 7",
      title: "STRATEGIC FOLLOW-UP & ANALYSIS",
      icon: "📊",
      color: { r: 20, g: 184, b: 166 }, // Teal
      tasks: [
        "Send professional follow-up messages to all brands contacted this week",
        "Respond comprehensively to any partnership inquiries or questions received",
        "Complete detailed analysis of outreach performance and response rates",
        "Plan and prioritize target brands for the following week's campaign",
        "Document lessons learned and optimize approach based on results"
      ],
      notes: "Consistent, professional follow-up differentiates serious athletes from casual requests.",
      tip: "Analyze which outreach methods generated the best response rates for future optimization."
    }
  ];
  
  dailyPlan.forEach((day, index) => {
    if (currentY > 650) {
      doc.addPage();
      currentY = 60;
      
      // Add page header for continuation pages
      doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("7-Day Sponsor Outreach Plan (continued)", pageWidth/2, 25, { align: 'center' });
      currentY = 70;
    }
    
    // Premium day card with gradient-style header
    const cardHeight = 180;
    
    // Card background
    doc.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
    doc.setLineWidth(1);
    doc.roundedRect(40, currentY, pageWidth - 80, cardHeight, 12, 12, 'FD');
    
    // Day header with custom color
    doc.setFillColor(day.color.r, day.color.g, day.color.b);
    doc.roundedRect(40, currentY, pageWidth - 80, 50, 12, 12, 'F');
    doc.rect(40, currentY + 38, pageWidth - 80, 12, 'F'); // Extend bottom for clean look
    
    // Day title with icon
    doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${day.icon} ${day.day}`, 60, currentY + 20);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(day.title, 60, currentY + 38);
    
    // Tasks section
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    let taskY = currentY + 65;
    day.tasks.forEach((task, taskIndex) => {
      // Checkbox
      doc.setDrawColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
      doc.setLineWidth(1);
      doc.rect(55, taskY - 8, 8, 8, 'D');
      
      // Task text
      doc.text(task, 70, taskY, { maxWidth: 460 });
      taskY += 14;
    });
    
    // Professional notes section
    const notesY = currentY + 135;
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(50, notesY - 5, pageWidth - 100, 35, 6, 6, 'F');
    
    // Notes content
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.text("💡 SUCCESS TIP:", 60, notesY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(day.notes, 60, notesY + 20, { maxWidth: 475 });
    
    // Pro tip if available
    if (day.tip) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
      doc.text(`⚡ PRO TIP: ${day.tip}`, 60, notesY + 32, { maxWidth: 475 });
    }
    
    currentY += cardHeight + 25;
  });
  
  // Professional success framework section
  if (currentY > 600) {
    doc.addPage();
    currentY = 60;
    
    // Add page header
    doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Success Framework & Best Practices", pageWidth/2, 25, { align: 'center' });
    currentY = 80;
  }
  
  // Premium success tips header
  doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.roundedRect(40, currentY - 10, pageWidth - 80, 45, 10, 10, 'F');
  
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("🏆 CHAMPIONSHIP SUCCESS PRINCIPLES", pageWidth/2, currentY + 15, { align: 'center' });
  
  currentY += 60;
  
  const successTips = [
    {
      title: "AUTHENTICITY OVER METRICS",
      content: "Genuine engagement and personal connection outperform follower counts every time",
      icon: "💎"
    },
    {
      title: "STRATEGIC RELATIONSHIP BUILDING", 
      content: "Focus on 5 high-quality connections rather than 50 generic mass messages",
      icon: "🎯"
    },
    {
      title: "PROFESSIONAL PERSISTENCE",
      content: "Most successful partnerships happen after multiple touchpoints - follow up strategically",
      icon: "🔄"
    },
    {
      title: "DATA-DRIVEN OPTIMIZATION",
      content: "Track all outreach activities and continuously refine your approach based on results",
      icon: "📊"
    },
    {
      title: "VALUE-FIRST APPROACH",
      content: "Lead conversations with what you can offer brands, not what you need from them",
      icon: "🎁"
    },
    {
      title: "CONSISTENT EXECUTION",
      content: "Success comes from sustained, disciplined effort over time - not sporadic bursts",
      icon: "⚡"
    }
  ];
  
  successTips.forEach((tip, index) => {
    const tipY = currentY + (index * 45);
    
    // Tip container
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(50, tipY - 5, pageWidth - 100, 35, 8, 8, 'F');
    
    // Icon and title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.text(`${tip.icon} ${tip.title}`, 65, tipY + 8);
    
    // Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(tip.content, 65, tipY + 22, { maxWidth: 460 });
  });
  
  currentY += successTips.length * 45 + 30;
  
  // Add tracking template page
  doc.addPage();
  
  // Tracking page header
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("OUTREACH TRACKING TEMPLATE", pageWidth/2, 35, { align: 'center' });
  
  // Simple tracking table without complex styling
  let tableY = 120;
  
  // Table headers
  doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.rect(40, tableY, 515, 25, 'F');
  
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  
  const headers = ["Brand Name", "Contact", "Date", "Method", "Response", "Next Action"];
  const colWidths = [85, 85, 70, 60, 50, 90];
  let headerX = 45;
  
  headers.forEach((header, index) => {
    doc.text(header, headerX, tableY + 15);
    headerX += colWidths[index];
  });
  
  // Table rows
  tableY += 25;
  for (let i = 0; i < 12; i++) {
    const rowY = tableY + (i * 25);
    
    // Alternating row colors
    if (i % 2 === 0) {
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.rect(40, rowY, 515, 25, 'F');
    }
    
    // Row borders
    doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
    doc.setLineWidth(0.5);
    doc.line(40, rowY, 555, rowY);
    
    // Column separators
    let colX = 40;
    colWidths.forEach(width => {
      colX += width;
      doc.line(colX, tableY, colX, rowY + 25);
    });
  }
  
  // Table border
  doc.setLineWidth(1);
  doc.rect(40, 120, 515, 325, 'D');
  
  // Weekly goals section
  let goalY = 480;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("WEEKLY GOALS & METRICS", 50, goalY);
  
  goalY += 30;
  const goals = [
    "Brands Researched: ___/10",
    "DMs Sent: ___/5", 
    "Emails Sent: ___/5",
    "Follow-ups Completed: ___/5",
    "Responses Received: ___",
    "Meetings Scheduled: ___"
  ];
  
  goals.forEach((goal, index) => {
    const x = index < 3 ? 70 : 320;
    const y = goalY + ((index % 3) * 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(`□ ${goal}`, x, y);
  });
  
  // Premium footer with branding
  const footerY = pageHeight - 50;
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, footerY, pageWidth, 50, 'F');
  
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(2);
  doc.line(50, footerY + 10, pageWidth - 50, footerY + 10);
  
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PLAYER'S BUDGET", pageWidth/2, footerY + 25, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.text("Professional Tennis Sponsor Tools | Premium Action Plan", pageWidth/2, footerY + 40, { align: 'center' });
  
  return doc.output('blob');
  
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate 7-day plan PDF: ${error.message}`);
  }
}
