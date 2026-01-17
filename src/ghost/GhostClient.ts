import { requestUrl, RequestUrlResponse } from 'obsidian';
import GhostPublisherPlugin from '../main';
import { createGhostJWT } from './jwt';
import { getErrorMessage } from './errors';

export interface GhostResponse {
  id: string;
  status: string;
  url?: string;
  title?: string;
}

export class GhostClient {
  plugin: GhostPublisherPlugin;

  constructor(plugin: GhostPublisherPlugin) {
    this.plugin = plugin;
  }

  private get baseUrl(): string {
    return `${this.plugin.settings.siteUrl}/ghost/api/admin`;
  }

  private async getHeaders() {
    const token = await createGhostJWT(this.plugin.settings.adminApiKey);
    return {
      Authorization: `Ghost ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request(options: { url: string; method: string; body?: string }) {
    const headers = await this.getHeaders();
    
    try {
      const response = await requestUrl({
        ...options,
        headers,
        throw: false,
      });

      if (response.status >= 400) {
        this.handleHttpError(response);
      }

      return response;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.toLowerCase().includes('timeout')) {
        throw new Error('Ghost API request timed out.');
      }
      throw error;
    }
  }

  private handleHttpError(response: RequestUrlResponse) {
    let message = `Ghost API Error (${response.status})`;
    try {
      const body = response.json;
      if (body && body.errors && body.errors.length > 0) {
        message = body.errors[0].message;
      }
    } catch (e) {}
    throw new Error(message);
  }

  async testConnection(): Promise<boolean> {
    if (!this.plugin.settings.siteUrl || !this.plugin.settings.adminApiKey) return false;
    const response = await this.request({
      url: `${this.baseUrl}/site/`,
      method: 'GET',
    });
    return response.status === 200;
  }

  async createPost(payload: any): Promise<GhostResponse> {
    const response = await this.request({
      url: `${this.baseUrl}/posts/`,
      method: 'POST',
      body: JSON.stringify({ posts: [payload] }),
    });
    const post = response.json.posts[0];
    return { id: post.id, status: post.status, url: post.url, title: post.title };
  }

  async updatePost(id: string, payload: any): Promise<GhostResponse> {
    const response = await this.request({
      url: `${this.baseUrl}/posts/${id}/`,
      method: 'PUT',
      body: JSON.stringify({ posts: [payload] }),
    });
    const post = response.json.posts[0];
    return { id: post.id, status: post.status, url: post.url, title: post.title };
  }
}
