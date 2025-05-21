import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/Auth.service';
import { Router } from '@angular/router'; // Import Router for redirection

@Component({
  selector: 'app-Navbar',
  templateUrl: './Navbar.component.html',
  styleUrls: ['./Navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private authService: AuthService ,private router: Router  ) {}

  ngOnInit() {
  }


logout(): void {
  this.authService.logout().subscribe(() => {
    this.router.navigate(['/login']);
  });
}

  
  
  
}
