using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Business.Abstract;
using Entities.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(UserForLoginDto userForLoginDto)
        {

            var result = await _authService.InitiateLogin(userForLoginDto);
            if (!result.Success) 
            {
                return BadRequest(result.Message);
            }
            
            return Ok(result.Data);

            //var userToLogin = await _authService.Login(userForLoginDto);
            //if (!userToLogin.Success)
            //{
            //    return BadRequest(userToLogin.Message);
            //}

            //var result = await _authService.CreateAccessToken(userToLogin.Data);
            //if (result.Success)
            //{
            //    return Ok(userToLogin.Message);
            //}

            //return BadRequest(userToLogin.Message);
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register(UserForRegisterDto userForRegisterDto)
        {
            var userExists = await _authService.UserExists(userForRegisterDto.Email);
            if (userExists.Success)
            {
                return BadRequest(userExists.Message);
            }

            var registerResult = await _authService.Register(userForRegisterDto, userForRegisterDto.Password);
            var result = await _authService.CreateAccessToken(registerResult.Data);
            if (result.Success)
            {
                return Ok(registerResult.Message);
            }

            return BadRequest(registerResult.Message);
        }
    }
}