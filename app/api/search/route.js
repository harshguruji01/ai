import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { query, mode = 'search', language = 'bilingual' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();
    const encodedQuery = encodeURIComponent(cleanQuery);

    let sources = [];

    // 1. Fetch from DuckDuckGo / Wikipedia / Academic / Dev API based on Mode
    try {
      // Fast educational & reference lookup via DuckDuckGo Instant Answer API
      const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`, {
        headers: { 'User-Agent': 'GuruAI-AnswerEngine/1.0 (+https://webguruji.online)' },
        next: { revalidate: 3600 }
      });

      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        
        if (ddgData.AbstractURL && ddgData.Heading) {
          const domain = new URL(ddgData.AbstractURL).hostname.replace('www.', '');
          sources.push({
            citationIndex: 1,
            title: ddgData.Heading,
            url: ddgData.AbstractURL,
            domain: domain,
            snippet: ddgData.AbstractText || ddgData.Abstract || `${cleanQuery} overview and educational facts.`,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
          });
        }

        // Related topics
        if (Array.isArray(ddgData.RelatedTopics)) {
          ddgData.RelatedTopics.slice(0, 4).forEach((topic) => {
            if (topic.FirstURL && topic.Text && sources.length < 5) {
              const domain = new URL(topic.FirstURL).hostname.replace('www.', '');
              sources.push({
                citationIndex: sources.length + 1,
                title: topic.Text.split(' - ')[0] || topic.Text.slice(0, 60),
                url: topic.FirstURL,
                domain: domain,
                snippet: topic.Text,
                favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('Search provider lookup warning:', err.message);
    }

    // 2. Mode-specific High-Credibility Fallback Sources (NCERT, Wikipedia, MDN, DevDocs)
    if (sources.length < 3) {
      if (mode === 'academic' || cleanQuery.toLowerCase().includes('ncert') || cleanQuery.toLowerCase().includes('class')) {
        sources.push({
          citationIndex: sources.length + 1,
          title: 'NCERT Official Educational Resources & Textbooks',
          url: 'https://ncert.nic.in/textbook.php',
          domain: 'ncert.nic.in',
          snippet: 'Official curriculum textbooks, syllabus guides, and chapter notes for Indian schools and board exams.',
          favicon: 'https://www.google.com/s2/favicons?domain=ncert.nic.in&sz=32'
        });
        sources.push({
          citationIndex: sources.length + 1,
          title: 'CBSE & State Board Academic Portal',
          url: 'https://www.cbse.gov.in',
          domain: 'cbse.gov.in',
          snippet: 'Board examination syllabus, model papers, and academic circulars.',
          favicon: 'https://www.google.com/s2/favicons?domain=cbse.gov.in&sz=32'
        });
      } else if (mode === 'coding' || cleanQuery.toLowerCase().includes('python') || cleanQuery.toLowerCase().includes('code')) {
        sources.push({
          citationIndex: sources.length + 1,
          title: 'MDN Web Docs & Software Architecture',
          url: 'https://developer.mozilla.org',
          domain: 'developer.mozilla.org',
          snippet: 'Comprehensive documentation, API references, and coding examples for modern developers.',
          favicon: 'https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=32'
        });
        sources.push({
          citationIndex: sources.length + 1,
          title: 'GeeksforGeeks Computer Science Portal',
          url: 'https://www.geeksforgeeks.org',
          domain: 'geeksforgeeks.org',
          snippet: 'Data structures, algorithms, coding doubts, and engineering interview preparation.',
          favicon: 'https://www.google.com/s2/favicons?domain=geeksforgeeks.org&sz=32'
        });
      } else {
        sources.push({
          citationIndex: sources.length + 1,
          title: `${cleanQuery} – Encyclopedia Reference`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanQuery.replace(/ /g, '_'))}`,
          domain: 'wikipedia.org',
          snippet: `Comprehensive peer-reviewed reference article and historical context on ${cleanQuery}.`,
          favicon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32'
        });
        sources.push({
          citationIndex: sources.length + 1,
          title: 'HarshGuruJi Knowledge Base & Educational Hub',
          url: 'https://webguruji.online',
          domain: 'webguruji.online',
          snippet: 'Verified educational guides, study resources, and digital learning tools.',
          favicon: 'https://webguruji.online/logo.png'
        });
      }
    }

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      mode: mode,
      sourcesCount: sources.length,
      sources: sources
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve sources', details: error.message },
      { status: 500 }
    );
  }
}
