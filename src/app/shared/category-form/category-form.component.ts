import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '../../graphql/categoryManagement/mutation';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent {

  @Output() close = new EventEmitter<void>();

  categoryForm!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  categoryId: string | null = null;
  loading = false;

  // 🔥 dynamic (DB se aayega)
  categoryTypes = [
    { id: 'FOOD', name: 'Food' },
    { id: 'DRINK', name: 'Drink' },
    { id: 'OTHER', name: 'Other' }
  ];

  displaySectionOptions = [
    { id: 'POS', name: 'POS' },
    { id: 'ONLINE', name: 'Online' }
  ];

  badgeOptions = [
    { id: 'TRENDING', name: 'Trending' },
    { id: 'BESTSELLER', name: 'Best Seller' },
    { id: 'NEW', name: 'New' }
  ];

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService
  ) {
    this.buildForm();
  }

  // ✅ CUSTOM ARRAY VALIDATOR
  atLeastOneSelected(control: AbstractControl) {
    const value = control.value as any[];
    return value && value.length > 0 ? null : { required: true };
  }

  buildForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', Validators.required],

      imageUrl: [
        '',
        Validators.pattern(
          /^(https?:\/\/.*|\/.*|data:image\/(png|jpeg|jpg|webp);base64,.*)$/
        )
      ],

      order: [1, [Validators.required, Validators.min(1)]],
      priority: [0, [Validators.required, Validators.min(0)]],

      categoryType: ['', Validators.required],
      displaySections: [[], Validators.required],
      badges: [[]],

      isActive: [true],
      isOnlineVisible: [true]
    });
  }

openFormFromParent(mode: 'add' | 'edit', data?: any) {
  this.mode = mode;

  if (mode === 'add') {
    this.categoryId = null;

    this.categoryForm.setValue({
      name: '',
      slug: '',
      imageUrl: '',
      order: 1,
      priority: 0,
      categoryType: '',
      displaySections: [],
      badges: [],
      isActive: true,
      isOnlineVisible: true
    });

    return;
  }

  if (mode === 'edit' && data) {
    this.categoryId = data._id;

    this.categoryForm.setValue({
      name: data.name ?? '',
      slug: data.slug ?? '',
      imageUrl: data.imageUrl ?? '',
      order: data.order ?? 1,
      priority: data.priority ?? 0,
      categoryType: data.categoryType ?? '',
      displaySections: Array.isArray(data.displaySections)
        ? [...data.displaySections]
        : [],
      badges: Array.isArray(data.badges)
        ? [...data.badges]
        : [],
      isActive: data.isActive ?? true,
      isOnlineVisible: data.isOnlineVisible ?? true
    });
  }
  console.log(this.categoryForm.value);
}

  updateSlug(event: any) {
    const name = event.target.value || '';
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    this.categoryForm.patchValue({ slug });
  }

toggleArrayValue(
  controlName: 'displaySections' | 'badges',
  value: string,
  checked: boolean
) {
  const control = this.categoryForm.get(controlName);
  if (!control) return;

  const current = Array.isArray(control.value)
    ? [...control.value]
    : [];

  if (checked) {
    if (!current.includes(value)) current.push(value);
  } else {
    const index = current.indexOf(value);
    if (index > -1) current.splice(index, 1);
  }

  control.setValue(current);
  control.markAsDirty();
  control.markAsTouched();
}

  submit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.toastr.error('Please fix validation errors');
      return;
    }

    this.loading = true;
    const payload = {
      ...this.categoryForm.value,
      displaySections: this.categoryForm.value.displaySections || []
    };

    const request =
      this.mode === 'edit'
        ? this.apollo.mutate({
          mutation: UPDATE_CATEGORY,
          variables: { id: this.categoryId, input: payload }
        })
        : this.apollo.mutate({
          mutation: CREATE_CATEGORY,
          variables: { input: payload }
        });

    request.subscribe({
      next: () => {
        this.loading = false;
        this.toastr.success(
          this.mode === 'edit'
            ? 'Category Updated Successfully'
            : 'Category Added Successfully'
        );
        this.closeModal();
      },
      error: err => {
        this.loading = false;
        this.toastr.error(err.message);
      }
    });
  }

  closeModal() {
    this.categoryForm.reset();
    this.close.emit();
  }
}