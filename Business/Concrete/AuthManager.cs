using Business.Abstract;
using Business.Constants;
using Core.Entities.Concrete;
using Core.Utilities.Results;
using Core.Utilities.Security.Hashing;
using Core.Utilities.Security.JWT;
using Entities.Concrete;
using Entities.Dtos;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Business.Concrete
{
    public class AuthManager : IAuthService
    {
        private IUserService _userService;
        private ITokenHelper _tokenHelper;
        private IOtpService _otpService;

        public AuthManager(IUserService userService, ITokenHelper tokenHelper, IOtpService otpService)
        {
            _userService = userService;
            _tokenHelper = tokenHelper;
            _otpService = otpService;
        }

        public async Task<IDataResult<OtpTicket>> InitiateLogin(UserForLoginDto userForLoginDto)
        {
            var userResult = await _userService.GetByMail(userForLoginDto.Email);
            if (userResult == null || userResult.Data == null)
                return new ErrorDataResult<OtpTicket>(Messages.UserNotFound);

            var user = userResult.Data;

            if (!HashingHelper.VerifyPasswordHash(userForLoginDto.Password, user.PasswordHash, user.PasswordSalt))
                return new ErrorDataResult<OtpTicket>(Messages.PasswordError);

          
            var ticket = _otpService.CreateTicketFor(user, ttl: TimeSpan.FromMinutes(2), maxAttempts: 5);


            var dto = new OtpTicket
            {
                TicketId = ticket.TicketId,
                ExpiresAt = ticket.ExpiresAt,
                CodeDevOnly = ticket.CodeDevOnly
            };

            return new SuccessDataResult<OtpTicket>(dto,Messages.OtpSent);
        }

        public async Task<IDataResult<AccessToken>> VerifyOtpAndCreateToken(OtpVerifyDto dto)
        {
            if (!_otpService.Validate(dto.TicketId, dto.Otp, out var userId))
                return new ErrorDataResult<AccessToken>(Messages.OtpInvalid);

            var user = _userService.GetAll().Result?.Data?.FirstOrDefault(u => u.Id == userId);
            if (user == null)
                return new ErrorDataResult<AccessToken>(Messages.UserNotFound);

            var claims = await _userService.GetClaims(user);
            var accessToken = _tokenHelper.CreateToken(user, claims);

            return new SuccessDataResult<AccessToken>(accessToken,Messages.SuccessfulLogin);
        }


        public async Task<IDataResult<User>> Register(UserForRegisterDto userForRegisterDto, string password)
        {
            byte[] passwordHash, passwordSalt;
            HashingHelper.CreatePasswordHash(password, out passwordHash, out passwordSalt);
            var user = new User
            {
                Email = userForRegisterDto.Email,
                FirstName = userForRegisterDto.FirstName,
                LastName = userForRegisterDto.LastName,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Status = true,
                PhoneNumber = "000-000-0000",
                Role = "Customer",
                isDeleted = false

            };
            await _userService.Add(user);
            return new SuccessDataResult<User>(user, Messages.UserRegistered);
        }

        public async Task<IDataResult<User>> Login(UserForLoginDto userForLoginDto)
        {
            var userToCheck = await _userService.GetByMail(userForLoginDto.Email);
            if (userToCheck == null || userToCheck.Data == null)
            {
                return new ErrorDataResult<User>(Messages.UserNotFound);
            }

            if (!HashingHelper.VerifyPasswordHash(
                    userForLoginDto.Password,
                    userToCheck.Data.PasswordHash,
                    userToCheck.Data.PasswordSalt))
            {
                return new ErrorDataResult<User>(Messages.PasswordError);
            }

            return new SuccessDataResult<User>(userToCheck.Data, Messages.SuccessfulLogin);
        }


        public async Task<IResult> UserExists(string email)
        {
            if (await _userService.GetByMail(email) != null)
            {
                return new ErrorResult(Messages.UserAlreadyExists);
            }
            return new SuccessResult();
        }

        public async Task<IDataResult<AccessToken>> CreateAccessToken(User user)
        {
            var claims = await _userService.GetClaims(user);
            var accessToken = _tokenHelper.CreateToken(user, claims);
            return new SuccessDataResult<AccessToken>(accessToken, Messages.AccessTokenCreated);
        }
    }
}