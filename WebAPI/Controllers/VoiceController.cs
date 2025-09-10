using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;


[ApiController]
[Route("api/voice")]
public class VoiceController : ControllerBase
{
    private readonly IHttpClientFactory _factory;
    private readonly IConfiguration _cfg;

    public VoiceController(IHttpClientFactory factory, IConfiguration cfg)
    {
        _factory = factory;
        _cfg = cfg;
    }

    // Swagger için doğru: multipart/form-data + FromForm DTO
    [HttpPost("interpret")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Interpret([FromForm] InterpretRequest request, CancellationToken ct)
    {
        if (request.Audio is null || request.Audio.Length == 0)
            return BadRequest(new { ok = false, error = "Ses dosyası gelmedi." });

        var baseUrl = _cfg["VoiceAssistant:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
            return StatusCode(500, new { ok = false, error = "VoiceAssistant:BaseUrl eksik." });

        var client = _factory.CreateClient();

        using var form = new MultipartFormDataContent();
        await using var stream = request.Audio.OpenReadStream();
        var sc = new StreamContent(stream);
        sc.Headers.ContentType = new MediaTypeHeaderValue("audio/wav");
        form.Add(sc, "file", request.Audio.FileName ?? "input.wav");

        using var resp = await client.PostAsync($"{baseUrl}/interpret", form, ct);
        var text = await resp.Content.ReadAsStringAsync(ct);
        return Content(text, "application/json");
    }
}
