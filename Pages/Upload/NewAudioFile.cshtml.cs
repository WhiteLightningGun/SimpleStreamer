using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.IO;

namespace SimpleStreamer.Pages;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
public class NewAudioFileModel(ILogger<IndexModel> logger) : PageModel
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
{
    private readonly ILogger<IndexModel> _logger = logger;
    private readonly string MainDirectory = Environment.CurrentDirectory;

    [BindProperty]
    [Required(ErrorMessage = "Songs Required")]
    public List<IFormFile>? Mp3Files { get; set; }

    [BindProperty]
    [Required(ErrorMessage = "Album name is required.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Artist name must be between 3 and 100 characters long.")]
    public string Artist { get; set; }

    [BindProperty]
    [Required(ErrorMessage = "Album name is required.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Album name must be between 3 and 100 characters long.")]
    public string Album { get; set; }

    public void OnGet()
    {
        _logger.LogInformation("Upload page accessed.");
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if(!ModelState.IsValid)
        {
            _logger.LogInformation("Invalid Model");
            return Page();
        }
        if (Mp3Files is null)
        {
            return RedirectToPage("./Index");
        }

        string FileBayPath = Path.Combine(MainDirectory, $"FileBay/{Artist}/{Album}");

        if(!Directory.Exists(FileBayPath))
        {
            Directory.CreateDirectory(FileBayPath);
        }

        foreach (var file in Mp3Files)
        {
            if (file.Length > 0)
            {
                string savePath = Path.Combine(FileBayPath, $"{file.FileName}");
                using var newFile = System.IO.File.Create(savePath);
                await file.CopyToAsync(newFile);
            }
        }

        // TODO: Save Artist and Album information

        return RedirectToPage("./NewAudioFile");
    }
}
