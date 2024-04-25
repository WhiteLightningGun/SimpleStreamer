using Microsoft.AspNetCore.Mvc;

namespace SimpleStreamer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MusicController : ControllerBase
    {
        private readonly string FileBayPath = Path.Combine(Environment.CurrentDirectory, $"FileBay");
        
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Hello from Music API" });
        }

        [HttpGet("Artists")]
        public IActionResult GetArtists()
        {
            IEnumerable<string> directories = Directory.EnumerateDirectories(FileBayPath);
            var artistDirectories = directories.Select(d => Path.GetFileName(d));
            return Ok(artistDirectories);
        }

        [HttpGet("GrabTrack")]
        public IActionResult GrabTrack(string Artist, string Album, string Song)
        {
            var musicPath = Path.Combine(FileBayPath, $"{Artist}/{Album}/{Song}.mp3");
            var stream =  System.IO.File.OpenRead(musicPath);

            if (stream.Length > 0 )
            {
                return File(stream, "audio/mpeg", enableRangeProcessing: true);
            }
            return NotFound();
        }

        /// <summary>
        /// Returns a json of the entire filebay directory and file tree. 
        /// </summary>
        /// <returns></returns>
        [HttpGet("AllMusic")]
        public IActionResult GetAllMusic()
        {
            var directoryTree = GetArtistsAlbumsSongs(FileBayPath);
            return Ok(directoryTree);
        }

        private static object GetArtistsAlbumsSongs(string path)
        {
            return Directory.EnumerateDirectories(path).Select(artistDirectory => new
            {
                Artist = Path.GetFileName(artistDirectory),
                Albums = Directory.EnumerateDirectories(artistDirectory).Select(albumDirectory => new
                {
                    Album = Path.GetFileName(albumDirectory),
                    Songs = Directory.EnumerateFiles(albumDirectory).Select(Path.GetFileName)
                })
            });
        }
    }
}