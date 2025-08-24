using Entities.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class OtpController : ControllerBase
{
    private readonly IAuthService _authService;

    public OtpController(IAuthService authService)
    {
        _authService = authService;
    }

    
    [HttpPost("verify")]
    public async Task<IActionResult> Verify(OtpVerifyDto dto)
    {
        var result = await _authService.VerifyOtpAndCreateToken(dto);
        if (!result.Success) return BadRequest(result.Message);
        return Ok(result.Data); 
    }
}
