export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const videoUrl = url.searchParams.get('url')

  if (!videoUrl) {
    return new Response(JSON.stringify({ success: false, message: 'URL required' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  try {
    let result = { success: false }

    if (videoUrl.includes('tiktok.com')) {
      const res = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(videoUrl))
      const d = await res.json()
      if (d.code === 0 && d.data) {
        result = {
          success: true,
          videoUrl: d.data.play || d.data.hdplay || d.data.wmplay,
          thumbnail: d.data.cover || '',
          title: d.data.title || 'TikTok',
          uploader: d.data.author?.nickname || '',
          duration: d.data.duration || '',
          fileName: 'tiktok.mp4'
        }
      }
    } else {
      const res = await fetch('https://social-dl.lmnx9.workers.dev/?url=' + encodeURIComponent(videoUrl) + '&format=video&quality=best')
      const d = await res.json()
      if (d.success && d.result) {
        const r = d.result
        let f = r.formats ? r.formats.filter(x => x.url && x.resolution !== 'audio only') : []
        if (!f.length && r.direct_url) f = [{ url: r.direct_url, ext: 'mp4' }]
        if (f.length > 0) {
          let dur = ''
          if (r.duration_seconds) {
            dur = Math.floor(r.duration_seconds / 60) + ':' + String(Math.floor(r.duration_seconds % 60)).padStart(2, '0')
          }
          result = {
            success: true,
            videoUrl: f[0].url,
            thumbnail: r.thumbnail || '',
            title: r.title || r.description || 'Video',
            uploader: r.uploader || '',
            duration: dur,
            fileName: 'video.' + (f[0].ext || 'mp4')
          }
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: 'Error' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
          }
